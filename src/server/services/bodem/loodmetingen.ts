import { generatePath } from 'react-router';

import { getBodemStatusSteps } from './loodmeting-status-line-items';
import {
  Lood365Response,
  LoodMetingDocument,
  LoodMetingFrontend,
  LoodMetingRequestsSource,
  LoodMetingStatusLowerCase,
  LoodMetingen,
} from './types';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Bodem/Bodem-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  isRecentNotification,
  sortAlpha,
} from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_SECOND_MS } from '../../config/app';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException } from '../monitoring';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';
import {
  DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
  DocumentDownloadData,
} from '../shared/document-download-route-handler';

export function getDataForLood365(authProfileAndToken: AuthProfileAndToken) {
  if (authProfileAndToken.profile.authMethod === 'digid') {
    return {
      bsn: authProfileAndToken.profile.id ?? '',
    };
  }

  if (authProfileAndToken.profile.authMethod === 'eherkenning') {
    return {
      kvk: authProfileAndToken.profile.id ?? '',
    };
  }
}

function transformLood365Response(
  sessionID: SessionID,
  response: Lood365Response
): LoodMetingen {
  let metingen: LoodMetingFrontend[] = [];

  if (!response.responsedata) {
    return metingen;
  }

  try {
    const sourceData: LoodMetingRequestsSource = JSON.parse(
      response.responsedata
    );

    const { Requests } = sourceData;

    metingen = Requests.flatMap((request) => {
      return request.Researchlocations.map((location) => {
        let document = null;

        if (
          !!location.Workorderid &&
          !!location.Reportsenton &&
          !!location.Reportavailable
        ) {
          const documentIDEncrypted = encryptSessionIdWithRouteIdParam(
            sessionID,
            location.Workorderid
          );

          document = {
            title: 'Rapport Lood in de bodem-check',
            id: location.Workorderid,
            url: generateFullApiUrlBFF(
              BffEndpoints.LOODMETING_DOCUMENT_DOWNLOAD,
              {
                id: documentIDEncrypted,
              }
            ),
            datePublished: location.Reportsenton,
          };
        }

        const lowercaseStatus =
          location.Friendlystatus.toLowerCase() as LoodMetingStatusLowerCase;
        const isProcessed = ['afgewezen', 'afgehandeld'].includes(
          lowercaseStatus
        );

        const statusToDecisionMapping = {
          ontvangen: null,
          'in behandeling': null,
          afgehandeld: 'Afgehandeld' as const,
          afgewezen: 'Afgewezen' as const,
        };
        const decision = statusToDecisionMapping[lowercaseStatus];

        const datumAfgehandeld = location?.Reportsenton ?? location?.ReviewedOn;
        const loodMeting: LoodMetingFrontend = {
          id: location.Reference,
          title: 'Lood in de bodem-check',
          adres: `${location.Street} ${location.Housenumber}${
            location?.Houseletter ?? ''
          }`,
          datumAanvraag: request.RequestedOn,
          datumAanvraagFormatted: request.RequestedOn
            ? defaultDateFormat(request.RequestedOn)
            : '',
          datumInbehandeling: location?.Workordercreatedon,
          datumAfgehandeld: datumAfgehandeld,
          datumAfgehandeldFormatted: datumAfgehandeld
            ? defaultDateFormat(datumAfgehandeld)
            : '',
          decision: decision,
          displayStatus: location.Friendlystatus,
          processed: isProcessed,
          kenmerk: location.Reference,
          aanvraagNummer: request.Reference,
          rapportBeschikbaar: location?.Reportavailable ?? false,
          rapportId: location?.Workorderid,
          redenAfwijzing: location?.Rejectionreason,
          link: {
            to: generatePath(routeConfig.detailPage.path, {
              id: location.Reference,
            }),
            title: 'Bekijk loodmeting',
          },
          document,
          steps: [],
        };

        loodMeting.steps = getBodemStatusSteps(loodMeting, lowercaseStatus);

        return loodMeting;
      });
    });
  } catch (e) {
    captureException(e);
  }
  metingen.sort(sortAlpha('adres', 'asc', 'lower'));

  return metingen;
}

export async function getLoodApiHeaders() {
  const url = `${getFromEnv('BFF_LOOD_API_URL')}`;

  const tokenResponse = await fetchAuthTokenHeader(
    {
      sourceApiName: 'LOOD_365',
      tokenValidityMS: 60 * 60 * ONE_SECOND_MS, // 1 hour
    },
    {
      clientID: getFromEnv('BFF_LOOD_USERNAME') ?? '',
      clientSecret: process.env.BFF_LOOD_PWD ?? '',
      tenantID: getFromEnv('BFF_LOOD_TENANT'),
      scope: `${url.substring(0, url.indexOf('api'))}.default`,
    }
  );

  return tokenResponse.status === 'OK' ? tokenResponse.content : undefined;
}

export async function fetchLoodmetingen(
  authProfileAndToken: AuthProfileAndToken
) {
  const data = getDataForLood365(authProfileAndToken);

  const requestConfig = getApiConfig('LOOD_365', {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/be_getrequestdetails`;
    },
    headers: await getLoodApiHeaders(),
    data,
    transformResponse: (responseData) =>
      transformLood365Response(authProfileAndToken.profile.sid, responseData),
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid
    ),
  });

  return requestData<LoodMetingen>(requestConfig);
}

export async function fetchLoodMetingDocument(
  _authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const requestConfig = getApiConfig('LOOD_365', {
    headers: await getLoodApiHeaders(),
    data: {
      workorderid: documentId,
    },
    formatUrl(requestConfig) {
      return `${requestConfig.url}/be_downloadleadreport`;
    },
    transformResponse: (documentResponseData: LoodMetingDocument) => {
      const data = Buffer.from(documentResponseData.documentbody, 'base64');
      return {
        filename: `${documentResponseData.filename ?? 'Besluit.pdf'}`,
        mimetype:
          documentResponseData.mimetype ?? DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
        data,
      };
    },
  });

  return requestData<DocumentDownloadData>(requestConfig);
}

export async function fetchLoodMetingNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const metingenResponse = await fetchLoodmetingen(authProfileAndToken);

  if (metingenResponse.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(
      metingenResponse.content
    )
      ? metingenResponse.content
          .map(createLoodNotification)
          .filter((notification) =>
            isRecentNotification(notification.datePublished)
          )
      : [];

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ metingenResponse });
}

function createLoodNotification(meting: LoodMetingFrontend): MyNotification {
  const baseNotification: Omit<
    MyNotification,
    'title' | 'description' | 'datePublished'
  > = {
    themaID: themaId,
    themaTitle: themaTitle,
    id: meting.kenmerk,
    link: {
      to: meting.link.to,
      title: 'Bekijk details',
    },
  };

  switch (meting.displayStatus.toLowerCase() as LoodMetingStatusLowerCase) {
    case 'in behandeling': {
      return {
        ...baseNotification,
        title: 'Aanvraag lood in de bodem-check in behandeling',
        description: `Uw aanvraag lood in de bodem-check voor ${meting.adres} is in behandeling genomen`,
        datePublished: meting.datumInbehandeling!,
      };
    }
    case 'afgehandeld': {
      return {
        ...baseNotification,
        title: 'Aanvraag lood in de bodem-check afgehandeld',
        description: `Uw aanvraag lood in de bodem-check voor ${meting.adres} is afgehandeld.`,
        datePublished: meting.datumAfgehandeld!,
      };
    }
    case 'afgewezen': {
      return {
        ...baseNotification,
        title: 'Aanvraag lood in de bodem-check afgewezen',
        description: `Uw aanvraag lood in de bodem-check voor ${meting.adres} is afgewezen.`,
        datePublished: meting.datumAfgehandeld!,
      };
    }
    default: {
      // Ontvangen as default since we are not sure what else to show if something unexpected comes from the source API.
      return {
        ...baseNotification,
        title: 'Aanvraag lood in de bodem-check ontvangen',
        description: `Uw aanvraag lood in de bodem-check voor ${meting.adres} is ontvangen.`,
        datePublished: meting.datumAanvraag,
      };
    }
  }
}

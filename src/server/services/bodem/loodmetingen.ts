import { generatePath } from 'react-router-dom';
import { differenceInMonths } from 'date-fns';
import FormData from 'form-data';
import { BFF_BASE_PATH, BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Lood365Response,
  LoodMeting,
  LoodMetingDocument,
  LoodMetingRequestsSource,
  LoodMetingen,
} from './types';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
  sortAlpha,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';

import { captureException } from '../monitoring';

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

function transformLood365Response(response: Lood365Response): LoodMetingen {
  let metingen: LoodMeting[] = [];

  if (!response.responsedata) {
    return { metingen };
  }

  try {
    const sourceData: LoodMetingRequestsSource = JSON.parse(
      response.responsedata
    );

    const { Requests } = sourceData;

    metingen = Requests.flatMap((request) => {
      return request.Researchlocations.map((location) => {
        return {
          adres: `${location.Street} ${location.Housenumber}${
            location?.Houseletter ?? ''
          }`,
          datumAanvraag: request.RequestedOn,
          datumInbehandeling: location?.Workordercreatedon,
          datumAfgehandeld: location?.Reportsenton,
          datumBeoordeling: location?.ReviewedOn,
          status: location.Friendlystatus,
          kenmerk: location.Reference,
          aanvraagNummer: request.Reference,
          rapportBeschikbaar: location?.Reportavailable ?? false,
          rapportId: location?.Workorderid,
          redenAfwijzing: location?.Rejectionreason,
          link: {
            to: generatePath(AppRoutes['BODEM/LOOD_METING'], {
              id: location.Reference,
            }),
            title: 'Bekijk loodmeting',
          },
          document:
            !!location.Workorderid &&
            !!location.Reportsenton &&
            !!location.Reportavailable
              ? {
                  title: 'Rapport Lood in de bodem-check',
                  id: location.Workorderid,
                  url: `${process.env.BFF_OIDC_BASE_URL}${generatePath(
                    `${BFF_BASE_PATH}${BffEndpoints.LOODMETING_DOCUMENT_DOWNLOAD}`,
                    {
                      id: location.Workorderid,
                    }
                  )}`,
                  datePublished: location.Reportsenton,
                }
              : null,
        };
      });
    });
  } catch (e) {
    captureException(e);
  }
  metingen.sort(sortAlpha('adres', 'asc', 'lower'));

  return { metingen };
}

export async function getLoodApiHeaders(requestID: requestID) {
  const url = `${process.env.BFF_LOOD_API_URL}`;
  const requestConfig = { ...getApiConfig('LOOD_365_OAUTH') };

  const data = new FormData();
  data.append('client_id', `${process.env.BFF_LOOD_USERNAME}`);
  data.append('client_secret', `${process.env.BFF_LOOD_PWD}`);
  data.append('scope', `${url.substring(0, url.indexOf('api'))}.default`);
  data.append('grant_type', 'client_credentials');

  requestConfig.data = data;
  // The receiving API is very strict about the headers. Without a boundary the request fails.
  requestConfig.headers = {
    'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
  };

  const response = await requestData<{ access_token: string }>(
    requestConfig,
    requestID
  );

  if (response.status === 'OK') {
    const { access_token } = response.content;

    return {
      Authorization: `Bearer ${access_token}`,
    };
  }

  return undefined;
}

export async function fetchLoodmetingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const data = getDataForLood365(authProfileAndToken);

  const requestConfig = getApiConfig('LOOD_365', {
    headers: await getLoodApiHeaders(requestID),
    data,
    transformResponse: transformLood365Response,
  });

  requestConfig.url = `${requestConfig.url}/be_getrequestdetails`;

  return requestData<LoodMetingen>(requestConfig, requestID);
}

export async function fetchLoodMetingDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  // First refetch all requests of this user
  const metingen = await fetchLoodmetingen(requestID, authProfileAndToken);

  // Check if the documentId is present in this users requests
  const isValidDocumentForUser = metingen.content?.metingen.find(
    (meting) => meting.rapportId === documentId
  );

  if (!isValidDocumentForUser) {
    return apiErrorResult('Unknown document', null);
  }

  const requestConfig = getApiConfig('LOOD_365', {
    headers: await getLoodApiHeaders(requestID),
    data: {
      workorderid: documentId,
    },
  });
  requestConfig.url = `${requestConfig.url}/be_downloadleadreport`;

  return requestData<LoodMetingDocument>(requestConfig, requestID);
}

export async function fetchLoodMetingNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const metingenResponse = await fetchLoodmetingen(
    requestID,
    authProfileAndToken
  );

  if (metingenResponse.status === 'OK') {
    const notifications: MyNotification[] = Array.isArray(
      metingenResponse.content.metingen
    )
      ? metingenResponse.content.metingen
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

function createLoodNotification(meting: LoodMeting) {
  const status = meting.status.toLocaleLowerCase();
  const inProgress = status === 'in behandeling';
  const isDone = status === 'afgehandeld';
  const isDenied = status === 'afgewezen';

  const notification: MyNotification = {
    chapter: Chapters.BODEM,
    id: meting.kenmerk,
    title: 'Aanvraag lood in de bodem-check ontvangen',
    description: `Uw aanvraag lood in de bodem-check voor ${meting.adres} is ontvangen.`,
    datePublished: meting.datumAanvraag,
    link: {
      to: meting.link.to,
      title: 'Bekijk details',
    },
  };

  if (inProgress) {
    notification.title = 'Aanvraag lood in de bodem-check in behandeling';
    notification.description = `Uw aanvraag lood in de bodem-check voor ${meting.adres} is in behandeling genomen`;
    notification.datePublished = meting.datumInbehandeling!;
  }

  if (isDone) {
    notification.title = 'Aanvraag lood in de bodem-check afgehandeld';
    notification.description = `Uw aanvraag lood in de bodem-check voor ${meting.adres} is afgehandeld.`;
    notification.datePublished = meting.datumAfgehandeld!;
  }

  if (isDenied) {
    notification.title = 'Aanvraag lood in de bodem-check afgewezen';
    notification.description = `Uw aanvraag lood in de bodem-check voor ${meting.adres} is afgewezen.`;
    notification.datePublished = meting.datumBeoordeling!;
  }

  return notification;
}

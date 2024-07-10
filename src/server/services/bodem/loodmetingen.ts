import FormData from 'form-data';
import { generatePath } from 'react-router-dom';
import {
  isRecentNotification,
  sortAlpha,
} from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';
import { BffEndpoints, DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import {
  Lood365Response,
  LoodMeting,
  LoodMetingDocument,
  LoodMetingRequestsSource,
  LoodMetingen,
} from './types';

import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { captureException } from '../monitoring';
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
  sessionID: AuthProfileAndToken['profile']['sid'],
  response: Lood365Response
): LoodMetingen {
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
        let document = null;

        if (
          !!location.Workorderid &&
          !!location.Reportsenton &&
          !!location.Reportavailable
        ) {
          const [documentIDEncrypted] = encrypt(
            `${sessionID}:${location.Workorderid}`
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
          document,
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
    transformResponse: (responseData) =>
      transformLood365Response(authProfileAndToken.profile.sid, responseData),
  });

  requestConfig.url = `${requestConfig.url}/be_getrequestdetails`;

  return requestData<LoodMetingen>(requestConfig, requestID);
}

export async function fetchLoodMetingDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const requestConfigBase = getApiConfig('LOOD_365');
  const requestConfig: DataRequestConfig = {
    ...requestConfigBase,
    headers: await getLoodApiHeaders(requestID),
    data: {
      workorderid: documentId,
    },
    url: `${requestConfigBase.url}/be_downloadleadreport`,
    transformResponse: (documentResponseData: LoodMetingDocument) => {
      const data = Buffer.from(documentResponseData.documentbody, 'base64');
      return {
        filename: `${documentResponseData.filename ?? 'Besluit.pdf'}`,
        mimetype:
          documentResponseData.mimetype ?? DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
        data,
      };
    },
  };

  return requestData<DocumentDownloadData>(requestConfig, requestID);
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
    thema: Themas.BODEM,
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

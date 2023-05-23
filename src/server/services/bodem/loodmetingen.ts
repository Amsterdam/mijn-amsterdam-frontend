import * as Sentry from '@sentry/node';
import { generatePath } from 'react-router-dom';
import { BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  Lood365Response,
  LoodMeting,
  LoodMetingDocument,
  LoodMetingRequestsSource,
  LoodMetingen,
} from './types';
import { AppRoutes, Chapters, IS_ACCEPTANCE } from '../../../universal/config';
import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { MONTHS_TO_KEEP_NOTIFICATIONS } from '../../../universal/helpers/vergunningen';
import { differenceInMonths } from 'date-fns';

function getDataForLood365(authProfileAndToken: AuthProfileAndToken) {
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
    return { metingen }; //Fout
  }

  try {
    const sourceData: LoodMetingRequestsSource = JSON.parse(
      response.responsedata
    );

    const { Requests } = sourceData;

    metingen = Requests.flatMap((request) => {
      return request.Researchlocations.map((location) => {
        return {
          adres: {
            straat: location.Street,
            huisnummer: location.Housenumber,
            huisletter: location?.Houseletter,
            postcode: location.Postalcode,
            stad: location.City,
          },
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
          document: location.Reportavailable
            ? {
                title: 'Rapport Lood in de bodem-check',
                id: location.Workorderid!,
                url: `${
                  IS_ACCEPTANCE
                    ? process.env.REACT_APP_BFF_API_URL_ACC
                    : process.env.REACT_APP_BFF_API_URL
                }${generatePath(BffEndpoints.LOODMETING_ATTACHMENTS, {
                  id: location.Workorderid!,
                })}`,
                datePublished: location.Reportsenton!,
              }
            : null,
        };
      });
    });
  } catch (e) {
    Sentry.captureException(e);
  }

  return { metingen };
}

function getLoodApiHeaders() {
  return {};
}

export async function fetchLoodmetingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const data = getDataForLood365(authProfileAndToken);
  const requestConfig = getApiConfig('LOOD_365', {
    transformResponse: transformLood365Response,
    data,
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
    headers: getLoodApiHeaders(),
    method: 'POST',
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

function isRecentNotification(
  datePublished: string,
  dateNow: Date = new Date()
): boolean {
  const diff = Math.abs(differenceInMonths(new Date(datePublished), dateNow));
  return diff < MONTHS_TO_KEEP_NOTIFICATIONS;
}

function createLoodNotification(meting: LoodMeting) {
  const inProgress =
    !!meting.datumInbehandeling &&
    !meting.datumAfgehandeld &&
    !meting.datumBeoordeling;
  const isDone = !!meting.datumAfgehandeld;
  const isDenied = !!meting.datumBeoordeling;

  const formattedAdress = `${meting.adres.straat} ${meting.adres.huisnummer}${
    meting.adres.huisletter ?? ''
  }`;

  const notification: MyNotification = {
    chapter: Chapters.BODEM,
    id: meting.kenmerk,
    title: 'Aanvraag lood in de bodem-check ontvangen',
    description: `Uw aanvraag lood in de bodem-check voor ${formattedAdress} is ontvangen.`,
    datePublished: meting.datumAanvraag,
    link: {
      to: meting.link.to,
      title: 'Bekijk details',
    },
  };

  if (inProgress) {
    notification.title = 'Aanvraag lood in de bodem-check in behandeling';
    notification.description = `Uw aanvraag lood in de bodem-check voor ${formattedAdress} is in behandeling genomen`;
    notification.datePublished = meting.datumInbehandeling!;
  }

  if (isDone) {
    notification.title = 'Aanvraag lood in de bodem-check afgehandeld';
    notification.description = `Uw aanvraag lood in de bodem-check voor ${formattedAdress} is afgehandeld.`;
    notification.datePublished = meting.datumAfgehandeld!;
  }

  if (isDenied) {
    notification.title = 'Aanvraag lood in de bodem-check afgewezen';
    notification.description = `Uw aanvraag lood in de bodem-check voor ${formattedAdress} is afgewezen.`;
    notification.datePublished = meting.datumBeoordeling!;
  }

  return notification;
}

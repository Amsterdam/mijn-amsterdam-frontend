import { differenceInCalendarDays, differenceInMonths } from 'date-fns';
import { generatePath } from 'react-router-dom';

import { AppRoutes } from '../../universal/config/routes';
import { Themas } from '../../universal/config/thema';
import {
  ApiResponse,
  ApiSuccessResponse,
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { defaultDateFormat } from '../../universal/helpers/date';
import {
  BRPData,
  BRPDataFromSource,
  MyNotification,
} from '../../universal/types';
import { AuthProfileAndToken } from '../auth/auth-types';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';
import { BffEndpoints } from '../routing/bff-routes';
import { generateFullApiUrlBFF } from '../routing/route-helpers';

const DAYS_BEFORE_EXPIRATION = 120;
const MONTHS_TO_KEEP_NOTIFICATIONS = 12;

// You need a id valid for 2 more month when returning to NL. So everyone with a expiring id before this date will probably want to renew their id before the summer holidays --> this creates a peak at the Stadsloket from march onwards.
const ID_BEWIJS_PEAK_DATE_START = new Date('2024-03-01');
const ID_BEWIJS_PEAK_DATE_END = new Date('2024-10-01');

const BrpDocumentTitles: Record<string, string> = {
  paspoort: 'paspoort',
  'europese identiteitskaart': 'ID-kaart',
  'nederlandse identiteitskaart': 'ID-kaart',
  rijbewijs: 'rijbewijs',
};

const BrpDocumentCallToAction: Record<string, string> = {
  paspoort: 'https://www.amsterdam.nl/burgerzaken/paspoort-id-kaart-aanvragen/',
  'europese identiteitskaart':
    'https://www.amsterdam.nl/burgerzaken/paspoort-id-kaart-aanvragen/',
  'nederlandse identiteitskaart':
    'https://www.amsterdam.nl/burgerzaken/paspoort-id-kaart-aanvragen/',
  rijbewijs: 'https://www.amsterdam.nl/burgerzaken/rijbewijs/',
};

export function transformBRPNotifications(data: BRPData, compareDate: Date) {
  const adresInOnderzoek = data?.persoon?.adresInOnderzoek;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data?.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const notifications: MyNotification[] = [];

  // Expired and not expired more than 12 months
  const expiredDocuments = data.identiteitsbewijzen?.filter((document) => {
    const dateExpired = new Date(document.datumAfloop);
    return (
      dateExpired < compareDate &&
      differenceInMonths(compareDate, dateExpired) <=
        MONTHS_TO_KEEP_NOTIFICATIONS
    );
  });

  const willExpireSoonDocuments = data.identiteitsbewijzen?.filter(
    (document) => {
      const days = differenceInCalendarDays(
        new Date(document.datumAfloop),
        compareDate
      );

      return days <= DAYS_BEFORE_EXPIRATION && days > 0;
    }
  );

  const documentsExpiringDuringPeak = data.identiteitsbewijzen?.filter(
    (document) => {
      const afloop = new Date(document.datumAfloop);
      return (
        afloop >= ID_BEWIJS_PEAK_DATE_START && afloop <= ID_BEWIJS_PEAK_DATE_END
      );
    }
  );

  if (expiredDocuments?.length) {
    expiredDocuments.forEach((document) => {
      const docTitle =
        BrpDocumentTitles[document.documentType] || document.documentType;
      notifications.push({
        thema: Themas.BURGERZAKEN,
        datePublished: compareDate.toISOString(),
        hideDatePublished: true,
        isAlert: true,
        id: `${docTitle}-datum-afloop-verstreken`,
        title: `Uw ${docTitle} is verlopen`,
        description: `Sinds ${defaultDateFormat(
          document.datumAfloop
        )} is uw ${docTitle} niet meer geldig.`,
        link: {
          to: BrpDocumentCallToAction[document.documentType],
          title: `Vraag uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (documentsExpiringDuringPeak?.length) {
    documentsExpiringDuringPeak.forEach((document) => {
      const docTitle =
        BrpDocumentTitles[document.documentType] || document.documentType;
      notifications.push({
        thema: Themas.BURGERZAKEN,
        datePublished: compareDate.toISOString(),
        isAlert: true,
        id: `${document.documentType}-datum-afloop-binnekort`,
        title: `Voorkom vertraging en verleng uw ${docTitle} op tijd`,
        description: `Vanaf maart tot de zomervakantie wordt het erg druk op het Stadsloket. Uw huidige ${docTitle} verloopt op ${defaultDateFormat(
          document.datumAfloop
        )}, vraag uw nieuwe ${docTitle} daarom ruim van te voren aan. Tip: in de ochtend is het rustiger bij het Stadsloket.`,
        link: {
          to: BrpDocumentCallToAction[document.documentType],
          title: `Vraag uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (!documentsExpiringDuringPeak?.length && willExpireSoonDocuments?.length) {
    willExpireSoonDocuments.forEach((document) => {
      const docTitle =
        BrpDocumentTitles[document.documentType] || document.documentType;
      notifications.push({
        thema: Themas.BURGERZAKEN,
        datePublished: compareDate.toISOString(),
        isAlert: true,
        hideDatePublished: true,
        id: `${document.documentType}-datum-afloop-binnekort`,
        title: `Uw ${docTitle} verloopt binnenkort`,
        description: `Vanaf ${defaultDateFormat(
          document.datumAfloop
        )} is uw ${docTitle} niet meer geldig.`,
        link: {
          to: BrpDocumentCallToAction[document.documentType],
          title: `Vraag uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (adresInOnderzoek) {
    notifications.push({
      thema: Themas.BRP,
      datePublished: compareDate.toISOString(),
      isAlert: true,
      id: 'brpAdresInOnderzoek',
      title: 'Adres in onderzoek',
      description:
        adresInOnderzoek === '080000'
          ? 'Op dit moment onderzoeken wij of u nog steeds woont op het adres waar u ingeschreven staat.'
          : 'Op dit moment onderzoeken wij op welk adres u nu woont.',
      link: {
        to: AppRoutes.BRP,
        title: 'Meer informatie',
      },
    });
  }

  if (isOnbekendWaarheen) {
    notifications.push({
      thema: Themas.BRP,
      datePublished: compareDate.toISOString(),
      isAlert: true,
      id: 'brpVertrokkenOnbekendWaarheen',
      title: 'Vertrokken Onbekend Waarheen (VOW)',
      description: `U staat sinds ${dateLeft} in de Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.`,
      link: {
        to: AppRoutes.BRP,
        title: 'Meer informatie',
      },
    });
  }

  return notifications;
}

export function transformBRPData(
  responseData: ApiSuccessResponse<BRPDataFromSource>
) {
  const responseContent = responseData.content;
  if (responseContent) {
    responseContent.fetchUrlAantalBewoners = generateFullApiUrlBFF(
      BffEndpoints.MKS_AANTAL_BEWONERS,
      {
        addressKeyEncrypted:
          responseContent?.adres?._adresSleutel ?? '--no-address-key--',
      }
    );
  }
  if (Array.isArray(responseContent?.identiteitsbewijzen)) {
    // Transform Identiteitsbewijzen
    Object.assign(responseContent, {
      identiteitsbewijzen: responseContent.identiteitsbewijzen.map(
        (document) => {
          const route = generatePath(AppRoutes['BURGERZAKEN/ID-KAART'], {
            id: document.id,
          });
          return Object.assign({}, document, {
            title:
              BrpDocumentTitles[document.documentType] || document.documentType,
            datumAfloop: document.datumAfloop,
            datumUitgifte: document.datumUitgifte,
            link: {
              to: route,
              title: document.documentType,
            },
          });
        }
      ),
    });
  }

  return responseContent as BRPData;
}

export async function fetchBRP(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('BRP', {
    transformResponse: transformBRPData,
  });

  return requestData<BRPData>(config, requestID, authProfileAndToken);
}

export async function fetchBrpNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BRP = await fetchBRP(requestID, authProfileAndToken);

  if (BRP.status === 'OK') {
    return apiSuccessResult({
      notifications: transformBRPNotifications(BRP.content, new Date()),
    });
  }
  return apiDependencyError({ BRP });
}

export async function fetchAantalBewoners(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  addressKeyEncrypted: string
) {
  const url = `${process.env.BFF_MKS_API_BASE_URL}/brp/aantal_bewoners`;

  return requestData(
    {
      url,
      method: 'POST',
      passthroughOIDCToken: true,
      data: {
        addressKey: addressKeyEncrypted,
      },
      transformResponse: (responseData: ApiResponse<string>) => {
        if (responseData.status === 'OK') {
          return responseData.content;
        }
        return responseData.content;
      },
    },
    requestID,
    authProfileAndToken
  );
}

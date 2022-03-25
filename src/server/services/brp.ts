import { differenceInCalendarDays, differenceInMonths } from 'date-fns';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../universal/config';
import { defaultDateFormat } from '../../universal/helpers';
import {
  BRPData,
  BRPDataFromSource,
  MyNotification,
} from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../helpers/app';

const DAYS_BEFORE_EXPIRATION = 120;
const MONTHS_TO_KEEP_NOTIFICATIONS = 12;

const BrpDocumentTitles: Record<string, string> = {
  paspoort: 'paspoort',
  'europese identiteitskaart': 'ID-kaart',
  'nederlandse identiteitskaart': 'ID-kaart',
  rijbewijs: 'rijbewijs',
};

const BrpDocumentCallToAction: Record<
  'isExpired' | 'willExpire',
  Record<string, string>
> = {
  isExpired: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    'europese identiteitskaart':
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    'nederlandse identiteitskaart':
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    rijbewijs: '',
  },
  willExpire: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    'europese identiteitskaart':
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    'nederlandse identiteitskaart':
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    rijbewijs: '',
  },
};

export function transformBRPNotifications(data: BRPData, compareDate: Date) {
  const inOnderzoek = data?.adres?.inOnderzoek || false;
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

  if (expiredDocuments?.length) {
    expiredDocuments.forEach((document) => {
      const docTitle =
        BrpDocumentTitles[document.documentType] || document.documentType;
      notifications.push({
        chapter: Chapters.BURGERZAKEN,
        datePublished: compareDate.toISOString(),
        hideDatePublished: true,
        isAlert: true,
        id: `${docTitle}-datum-afloop-verstreken`,
        title: `Uw ${docTitle} is verlopen`,
        description: `Sinds ${defaultDateFormat(
          document.datumAfloop
        )} is uw ${docTitle} niet meer geldig.`,
        link: {
          to: BrpDocumentCallToAction.isExpired[document.documentType],
          title: `Vraag uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (willExpireSoonDocuments?.length) {
    willExpireSoonDocuments.forEach((document) => {
      const docTitle =
        BrpDocumentTitles[document.documentType] || document.documentType;
      notifications.push({
        chapter: Chapters.BURGERZAKEN,
        datePublished: compareDate.toISOString(),
        isAlert: true,
        hideDatePublished: true,
        id: `${document.documentType}-datum-afloop-binnekort`,
        title: `Uw ${docTitle} verloopt binnenkort`,
        description: `Vanaf ${defaultDateFormat(
          document.datumAfloop
        )} is uw ${docTitle} niet meer geldig.`,
        link: {
          to: BrpDocumentCallToAction.isExpired[document.documentType],
          title: `Vraag uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (inOnderzoek) {
    notifications.push({
      chapter: Chapters.BRP,
      datePublished: compareDate.toISOString(),
      isAlert: true,
      id: 'brpAdresInOnderzoek',
      title: 'Adres in onderzoek',
      description:
        'Op dit moment onderzoeken wij of u nog steeds woont op het adres waar u ingeschreven staat.',
      link: {
        to: AppRoutes.BRP,
        title: 'Meer informatie',
      },
    });
  }

  if (isOnbekendWaarheen) {
    notifications.push({
      chapter: Chapters.BRP,
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

export function transformBRPData(responseData: BRPDataFromSource) {
  if (Array.isArray(responseData.identiteitsbewijzen)) {
    // Transform Identiteitsbewijzen
    Object.assign(responseData, {
      identiteitsbewijzen: responseData.identiteitsbewijzen.map((document) => {
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
      }),
    });
  }

  return responseData as BRPData;
}

export async function fetchBRP(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const options = getApiConfig('BRP', {
    transformResponse: transformBRPData,
  });

  return requestData<BRPData>(options, sessionID, authProfileAndToken);
}

export async function fetchBRPGenerated(
  sessionID: SessionID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BRP = await fetchBRP(sessionID, authProfileAndToken);

  if (BRP.status === 'OK') {
    return apiSuccessResult({
      notifications: transformBRPNotifications(BRP.content, new Date()),
    });
  }
  return apiDependencyError({ BRP });
}

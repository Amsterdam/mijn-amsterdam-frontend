import { differenceInCalendarDays } from 'date-fns';
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

const DAYS_BEFORE_EXPIRATION = 120;

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
    rijbewijs: '',
  },
  willExpire: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    'europese identiteitskaart':
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

  const expiredDocuments = data.identiteitsbewijzen?.filter(
    document => new Date(document.datumAfloop) < compareDate
  );

  const willExpireSoonDocuments = data.identiteitsbewijzen?.filter(document => {
    const days = differenceInCalendarDays(
      new Date(document.datumAfloop),
      compareDate
    );

    return days <= DAYS_BEFORE_EXPIRATION && days > 0;
  });

  if (expiredDocuments?.length) {
    expiredDocuments.forEach(document => {
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
          title: `Vraag snel uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (willExpireSoonDocuments?.length) {
    willExpireSoonDocuments.forEach(document => {
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
          title: `Vraag snel uw nieuwe ${docTitle} aan`,
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
      title: 'Vertrokken - onbekend waarheen',
      description: `U staat sinds ${dateLeft} in Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.`,
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
      identiteitsbewijzen: responseData.identiteitsbewijzen.map(document => {
        const route = generatePath(AppRoutes.BURGERZAKEN_DOCUMENT, {
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

export function fetchBRP(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  const options = getApiConfig('BRP', {
    transformResponse: (responseData: BRPDataFromSource) =>
      raw ? responseData : transformBRPData(responseData),
  });

  return requestData<BRPData>(options, sessionID, samlToken);
}

export async function fetchBRPGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  const BRP = await fetchBRP(sessionID, samlToken);
  let notifications: MyNotification[] = [];

  if (BRP.status === 'OK') {
    notifications = transformBRPNotifications(BRP.content, new Date());
  }

  return {
    notifications,
  };
}

import { differenceInCalendarDays } from 'date-fns';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../universal/config';
import { defaultDateFormat } from '../../universal/helpers';
import { Adres, BRPData, MyNotification } from '../../universal/types';
import { requestData } from '../helpers';
import { ApiUrls, getApiConfigValue } from '../config';

const DAYS_BEFORE_EXPIRATION = 120;

const BrpDocumentTitles: Record<string, string> = {
  paspoort: 'paspoort',
  identiteitskaart: 'ID-kaart',
  rijbewijs: 'rijbewijs',
};

const BrpDocumentCallToAction: Record<
  'isExpired' | 'willExpire',
  Record<string, string>
> = {
  isExpired: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    identiteitskaart:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    rijbewijs: '',
  },
  willExpire: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    identiteitskaart:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    rijbewijs: '',
  },
};

export function getFullAddress(adres: Adres) {
  return `${adres.straatnaam} ${adres.huisnummer || ''} ${adres.huisletter ||
    ''} ${adres.huisnummertoevoeging || ''}`.trim();
}

export function getBagSearchAddress(adres: Adres) {
  return `${adres.straatnaam} ${adres.huisnummer || ''}`;
}

export function transformBRPNotifications(data: BRPData) {
  const now = new Date();
  const inOnderzoek = data?.adres?.inOnderzoek || false;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data?.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const notifications: MyNotification[] = [];

  const expiredDocuments =
    !!data.reisDocumenten &&
    data.reisDocumenten.filter(
      document => new Date(document.ISOdatumAfloop) < now
    );

  const willExpireSoonDocuments =
    !!data.reisDocumenten &&
    data.reisDocumenten.filter(document => {
      const days = differenceInCalendarDays(
        new Date(document.ISOdatumAfloop),
        now
      );

      return days <= DAYS_BEFORE_EXPIRATION && days > 0;
    });

  if (!!expiredDocuments && expiredDocuments.length) {
    expiredDocuments.forEach(document => {
      const docTitle = BrpDocumentTitles[document.documentType];
      notifications.push({
        chapter: Chapters.BURGERZAKEN,
        datePublished: now.toISOString(),
        hideDatePublished: true,
        isAlert: true,
        id: `${docTitle}-datum-afloop-verstreken`,
        title: `Uw ${docTitle} is verlopen`,
        description: `Sinds ${document.datumAfloop} is uw ${docTitle} niet meer geldig.`,
        link: {
          to: BrpDocumentCallToAction.isExpired[document.documentType],
          title: `Vraag snel uw nieuwe ${docTitle} aan`,
        },
      });
    });
  }

  if (!!willExpireSoonDocuments && willExpireSoonDocuments.length) {
    willExpireSoonDocuments.forEach(document => {
      const docTitle = BrpDocumentTitles[document.documentType];
      notifications.push({
        chapter: Chapters.BURGERZAKEN,
        datePublished: now.toISOString(),
        isAlert: true,
        hideDatePublished: true,
        id: `${document.documentType}-datum-afloop-binnekort`,
        title: `Uw ${docTitle} verloopt binnenkort`,
        description: `Vanaf ${document.datumAfloop} is uw ${docTitle} niet meer geldig.`,
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
      datePublished: now.toISOString(),
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
      datePublished: now.toISOString(),
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

function transformBRPData(responseData: BRPData) {
  if (Array.isArray(responseData.reisDocumenten)) {
    Object.assign(responseData, {
      reisDocumenten: responseData.reisDocumenten.map(document => {
        const route = generatePath(AppRoutes.BURGERZAKEN_DOCUMENT, {
          id: document.documentNummer,
        });
        return Object.assign({}, document, {
          title: BrpDocumentTitles[document.documentType],
          datumAfloop: defaultDateFormat(document.datumAfloop),
          ISOdatumAfloop: document.datumAfloop,
          datumUitgifte: defaultDateFormat(document.datumUitgifte),
          ISOdatumUitgifte: document.datumUitgifte,
          link: {
            to: route,
            title: document.documentType,
          },
        });
      }),
    });
  }

  return responseData;
}

export function fetchBRP(sessionID: SessionID) {
  return requestData<BRPData>(
    {
      url: ApiUrls.BRP,
      transformResponse: transformBRPData,
    },
    sessionID,
    getApiConfigValue('BRP', 'postponeFetch', false)
  );
}

export async function fetchBRPGenerated(sessionID: SessionID) {
  const BRP = await fetchBRP(sessionID);
  let notifications: MyNotification[] = [];

  if (BRP.status === 'OK') {
    notifications = transformBRPNotifications(BRP.content);
  }

  return {
    notifications,
  };
}

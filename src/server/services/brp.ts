import { ApiUrls, AppRoutes, Chapter, Chapters } from '../../universal/config';

import { defaultDateFormat } from '../../universal/helpers';
import { requestData } from '../helpers';
import { MyNotification } from '../../universal/types/App.types';
import { differenceInCalendarDays } from 'date-fns';
import { generatePath } from 'react-router-dom';

export interface ReisDocument {
  documentNummer: string;
  documentType: 'identiteitskaart' | 'paspoort';
  datumUitgifte: string;
  datumAfloop: string;
  title: string;
}

export interface Adres {
  straatnaam: string;
  postcode: string;
  woonplaatsNaam: string;
  huisnummer: string;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  inOnderzoek: boolean;
}

export interface Persoon {
  aanduidingNaamgebruikOmschrijving: string;
  bsn: string;
  geboortedatum: string;
  overlijdensdatum: string | null;
  geboortelandnaam: string;
  geboorteplaatsnaam: string;
  gemeentenaamInschrijving: string;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string;
  omschrijvingBurgerlijkeStaat: string;
  omschrijvingGeslachtsaanduiding: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string;
  voornamen: string;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string;
}

export interface Verbintenis {
  datumOntbinding: string | null;
  datumSluiting: string;
  landnaamSluiting: string;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
  persoon: Persoon;
}

export interface Kind {
  bsn: string;
  geboortedatum: string;
  geslachtsaanduiding: string;
  geslachtsnaam: string;
  overlijdensdatum: string;
  voornamen: string;
  voorvoegselGeslachtsnaam: string;
}

export interface BRPData {
  persoon: Persoon;
  verbintenis?: Verbintenis;
  verbintenisHistorisch?: Verbintenis[];
  kinderen?: Kind[];
  ouders: Persoon[];
  adres: Adres;
  adresHistorisch?: Adres[];
  reisDocumenten?: ReisDocument[];
  notifications: MyNotification[];
}

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
      document => new Date(document.datumAfloop) < now
    );

  const willExpireSoonDocuments =
    !!data.reisDocumenten &&
    data.reisDocumenten.filter(document => {
      const days = differenceInCalendarDays(
        new Date(document.datumAfloop),
        now
      );

      return days <= DAYS_BEFORE_EXPIRATION && days > 0;
    });

  if (!!expiredDocuments && expiredDocuments.length) {
    expiredDocuments.forEach(document => {
      const docTitle = BrpDocumentTitles[document.documentType];
      notifications.push({
        chapter: 'ALERT',
        datePublished: now.toISOString(),
        hideDatePublished: true,
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

  if (!!willExpireSoonDocuments && willExpireSoonDocuments.length) {
    willExpireSoonDocuments.forEach(document => {
      const docTitle = BrpDocumentTitles[document.documentType];
      notifications.push({
        chapter: 'ALERT',
        datePublished: now.toISOString(),
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
      chapter: 'ALERT',
      datePublished: now.toISOString(),
      id: 'brpAdresInOnderzoek',
      title: 'Adres in onderzoek',
      description:
        'Op dit moment onderzoeken wij of u nog steeds woont op het adres waar u ingeschreven staat.',
      link: {
        to: AppRoutes.MIJN_GEGEVENS,
        title: 'Meer informatie',
      },
    });
  }

  if (isOnbekendWaarheen) {
    notifications.push({
      chapter: 'ALERT',
      datePublished: now.toISOString(),
      id: 'brpVertrokkenOnbekendWaarheen',
      title: 'Vertrokken - onbekend waarheen',
      description: `U staat sinds ${dateLeft} in Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.`,
      link: {
        to: AppRoutes.MIJN_GEGEVENS,
        title: 'Meer informatie',
      },
    });
  }

  return notifications;
}

function transformBRPData(responseData: BRPData) {
  Object.assign(responseData, {
    notifications: transformBRPNotifications(responseData),
  });

  if (Array.isArray(responseData.reisDocumenten)) {
    Object.assign(responseData, {
      reisDocumenten: responseData.reisDocumenten.map(document => {
        const route = generatePath(AppRoutes.BURGERZAKEN_DOCUMENT, {
          id: document.documentNummer,
        });
        return Object.assign({}, document, {
          title: BrpDocumentTitles[document.documentType],
          datumAfloop: defaultDateFormat(document.datumAfloop),
          datumUitgifte: defaultDateFormat(document.datumUitgifte),
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
    sessionID
  );
}

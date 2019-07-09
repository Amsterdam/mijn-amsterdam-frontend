import { ExternalUrls } from 'App.constants';
import { defaultDateFormat } from 'helpers/App';

export const panelConfig = {
  person: {
    title: 'Persoonlijke gegevens',
    actionLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      },
    ],
  },
  address: {
    title: 'Woonadres',
    actionLinks: [
      {
        title: 'Verhuizing doorgeven',
        url: ExternalUrls.REPORT_RELOCATION,
        external: true,
      },
    ],
  },
  maritalStatus: {
    title: 'Burgerlijke staat',
    actionLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      },
    ],
  },
};

export const brpInfoLabels = {
  FirstName: 'Voornamen',
  PreLastName: 'Voorvoegsel',
  LastName: 'Achternaam',
  Gender: 'Geslacht',
  BSN: 'BSN',
  DateOfBirth: 'Geboortedatum',
  PlaceOfBirth: 'Geboorteplaats',
  CountryOfBirth: 'Geboorteland',
  Nationality: 'Nationaliteit',
  Date: 'Datum',
  Place: 'Plaats',
  Street: 'Straat',
  Country: 'Land',
  DateStarted: 'Sinds',
  MaritalStatusType: 'Soort verbintenis',
  Address: 'Adres',
};

interface Adres {
  straatnaam: string;
  postcode: string;
  woonplaatsNaam: string;
  huisnummer: string;
  huisnummertoevoeging: string;
  huisletter: string;
  begindatumVerblijf: string;
}

interface Partner {
  bsn: string;
  geboortedatum: string;
  geslachtsaanduiding: string;
  geslachtsnaam: string;
  overlijdensdatum: string;
  voornamen: string;
  voorvoegselGeslachtsnaam: string;
}

interface Persoon {
  aanduidingNaamgebruikOmschrijving: string;
  bsn: string;
  geboortedatum: string;
  geboortelandnaam: string;
  geboorteplaatsnaam: string;
  gemeentenaamInschrijving: string;
  voorvoegselGeslachtsnaam: string;
  geslachtsnaam: string;
  omschrijvingBurgerlijkeStaat: string;
  omschrijvingGeslachtsaanduiding: string;
  opgemaakteNaam: string;
  voornamen: string;
  nationaliteiten: Array<{ omschrijving: string }>;
}

export type Person = Persoon;

interface Verbintenis {
  datumOntbinding: string;
  datumSluiting: string;
  landnaamSluiting: string;
  persoon: Partner;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
}

interface Kind {
  bsn: string;
  geboortedatum: string;
  geslachtsaanduiding: string;
  geslachtsnaam: string;
  overlijdensdatum: string;
  voornamen: string;
  voorvoegselGeslachtsnaam: string;
}

export interface BrpResponseData {
  persoon: Persoon;
  verbintenis?: Verbintenis;
  kinderen?: Kind[];
  adres: Adres;
}

// NOTE: Preferred simple interface here.
export interface ProfileData {
  person: {
    [label: string]: string | number;
  };
  maritalStatus: {
    [label: string]: string | number;
  } | null;
  address: {
    [label: string]: string;
  } | null;
}

export function getFullName(person: Persoon) {
  return `${person.voornamen} ${person.voorvoegselGeslachtsnaam || ''} ${
    person.geslachtsnaam
  }`;
}

export function getFullAddress(address: Adres) {
  return `${address.straatnaam} ${address.huisnummer} ${address.huisletter ||
    address.huisnummertoevoeging ||
    ''}`;
}

export function formatProfileData({
  persoon,
  adres,
  verbintenis,
  kinderen,
}: BrpResponseData): ProfileData | null {
  if (!persoon) {
    return null;
  }
  return {
    person: {
      [brpInfoLabels.FirstName]: persoon.voornamen,
      [brpInfoLabels.PreLastName]: persoon.voorvoegselGeslachtsnaam,
      [brpInfoLabels.LastName]: persoon.geslachtsnaam,
      [brpInfoLabels.Gender]: persoon.omschrijvingGeslachtsaanduiding,
      [brpInfoLabels.BSN]: persoon.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(persoon.geboortedatum),
      [brpInfoLabels.PlaceOfBirth]: persoon.geboorteplaatsnaam,
      [brpInfoLabels.CountryOfBirth]: persoon.geboortelandnaam,
      [brpInfoLabels.Nationality]: persoon.nationaliteiten.reduce(
        (str, { omschrijving }) => str + omschrijving + ' ',
        ''
      ),
    },
    address: {
      [brpInfoLabels.Street]: `${adres.straatnaam} ${
        adres.huisnummer
      } ${adres.huisnummertoevoeging || ''}${adres.huisletter || ''}`,
      [brpInfoLabels.Place]: `${adres.postcode} ${adres.woonplaatsNaam || ''}`,
      [brpInfoLabels.DateStarted]: defaultDateFormat(adres.begindatumVerblijf),
    },
    maritalStatus:
      verbintenis && verbintenis.persoon && !verbintenis.datumOntbinding
        ? {
            [brpInfoLabels.MaritalStatusType]:
              verbintenis.soortVerbintenisOmschrijving,
            [brpInfoLabels.Date]: verbintenis.datumSluiting
              ? defaultDateFormat(verbintenis.datumSluiting)
              : 'Onbekend',
            [brpInfoLabels.Place]:
              verbintenis.plaatsnaamSluitingOmschrijving || 'Onbekend',
            [brpInfoLabels.Country]: verbintenis.landnaamSluiting || 'Onbekend',
            [brpInfoLabels.FirstName]: verbintenis.persoon.voornamen,
            [brpInfoLabels.PreLastName]:
              verbintenis.persoon.voorvoegselGeslachtsnaam,
            [brpInfoLabels.LastName]: verbintenis.persoon.geslachtsnaam,
            [brpInfoLabels.DateOfBirth]: defaultDateFormat(
              verbintenis.persoon.geboortedatum
            ),
          }
        : null,
  };
}

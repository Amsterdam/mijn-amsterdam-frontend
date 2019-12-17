import { entries } from 'helpers/App';
import { BrpApiState } from 'hooks/api/api.brp';
import { defaultDateFormat } from '../helpers/App';

type Value = string | number | null;
type FormattedProfileValue =
  | string
  | [string, (value: any, brpData?: BrpResponseData) => Value];

type ProfileLabels<T> = { [key in keyof T]: FormattedProfileValue };

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

interface Partner {
  bsn: string;
  geboortedatum: string;
  geslachtsaanduiding: string | null;
  geslachtsnaam: string;
  overlijdensdatum: string | null;
  voornamen: string;
  voorvoegselGeslachtsnaam: string | null;
}

export interface Persoon {
  aanduidingNaamgebruikOmschrijving: string;
  bsn: string;
  geboortedatum: string;
  geboortelandnaam: string;
  geboorteplaatsnaam: string;
  gemeentenaamInschrijving: string;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string;
  omschrijvingBurgerlijkeStaat: string;
  omschrijvingGeslachtsaanduiding: string | null;
  opgemaakteNaam: string;
  voornamen: string;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string;
}

interface Verbintenis extends Partner {
  datumOntbinding: string | null;
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
  verbintenis?: Verbintenis[];
  kinderen?: Kind[];
  ouders: Persoon[];
  adres: Adres[];
}

export function getFullName(persoon: Persoon) {
  return `${persoon.voornamen} ${
    persoon.voorvoegselGeslachtsnaam
      ? persoon.voorvoegselGeslachtsnaam + ' '
      : ''
  }${persoon.geslachtsnaam}`;
}

export function getFullAddress(adres: Adres) {
  return `${adres.straatnaam} ${adres.huisnummer || ''} ${adres.huisletter ||
    ''} ${adres.huisnummertoevoeging || ''}`;
}

export function isMokum(BRP: BrpApiState) {
  return !!BRP?.data?.persoon?.mokum;
}

const persoon: ProfileLabels<Partial<Persoon>> = {
  voornamen: 'Voornamen',
  voorvoegselGeslachtsnaam: 'Voorvoegsel',
  geslachtsnaam: 'Achternaam',
  omschrijvingGeslachtsaanduiding: 'Geslacht',
  geboortedatum: ['Geboortedatum', value => defaultDateFormat(value)],
  geboorteplaatsnaam: 'Geboorteplaats',
  geboortelandnaam: 'Geboorteland',
  nationaliteiten: [
    'Nationaliteit',
    value =>
      Array.isArray(value)
        ? value.map(({ omschrijving }) => omschrijving).join(' ')
        : 'Onbekend',
  ],
  bsn: 'BSN',
};

const adres: ProfileLabels<Partial<Adres>> = {
  straatnaam: [
    'Straat',
    (_value, brpData) => {
      const [adres] = brpData?.adres || [];
      return !!adres ? getFullAddress(adres) : 'Onbekend';
    },
  ],
  woonplaatsNaam: [
    'Plaats',
    (_value, brpData) => {
      const [adres] = brpData?.adres || [];
      return !!adres ? adres.woonplaatsNaam : 'Onbekend';
    },
  ],
  begindatumVerblijf: [
    'Sinds',
    value => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
};

function partner(key: keyof Partner, defaultValue: Value = null) {
  return (_value: any, brpData?: BrpResponseData): Value => {
    const [verbintenis] = brpData?.verbintenis || [];
    return verbintenis?.persoon[key] || defaultValue;
  };
}

const verbintenis: ProfileLabels<Partial<Verbintenis>> = {
  soortVerbintenisOmschrijving: [
    'Soort verbintenis',
    value => value || 'Onbekend',
  ],
  datumSluiting: [
    'Sinds',
    value => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
  plaatsnaamSluitingOmschrijving: ['Plaats', value => value || 'Onbekend'],
  landnaamSluiting: ['Land', value => value || 'Onbekend'],
  datumOntbinding: 'Datum ontbinding',
  voornamen: ['Voornamen', partner('voornamen')],
  voorvoegselGeslachtsnaam: [
    'Voorvoegsel',
    partner('voorvoegselGeslachtsnaam'),
  ],
  geslachtsnaam: ['Achternaam', partner('geslachtsnaam')],
  // bsn: ['BSN', partner('bsn')],
  geboortedatum: [
    'Geboortedatum',
    (_value, brpData) => {
      const [verbintenis] = brpData?.verbintenis || [];
      return verbintenis?.persoon.geboortedatum
        ? defaultDateFormat(verbintenis.persoon.geboortedatum)
        : null;
    },
  ],
  overlijdensdatum: [
    'Overlijdensdatum',
    (_value, brpData) => {
      const [verbintenis] = brpData?.verbintenis || [];
      return verbintenis?.persoon.overlijdensdatum
        ? defaultDateFormat(verbintenis.persoon.overlijdensdatum)
        : null;
    },
  ],
};

export const brpInfoLabels = {
  persoon,
  adres,
  verbintenis,
  // kinderen: {},
  // ouders: {},
  // adressen: {},
};

function format(
  labelConfig: ProfileLabels<any>,
  data: any,
  brpData: BrpResponseData
) {
  const formattedData = entries(labelConfig).reduce((acc, [key, formatter]) => {
    const label = Array.isArray(formatter) ? formatter[0] : formatter;
    const value = Array.isArray(formatter)
      ? formatter[1](data[key], brpData)
      : data[key];
    return {
      ...acc,
      [label]: value,
    };
  }, {});

  return formattedData;
}

interface BrpProfileData {
  [key: string]: { [key: string]: Value };
}

export function formatBrpProfileData(brpData: BrpResponseData): BrpProfileData {
  const [adres] = brpData.adres;
  const [verbintenis] = brpData.verbintenis || [];

  const profileData: BrpProfileData = {
    persoon: format(brpInfoLabels.persoon, brpData.persoon, brpData),
    adres: format(brpInfoLabels.adres, adres, brpData),
  };

  if (verbintenis && !verbintenis.datumOntbinding) {
    profileData.verbintenis = format(
      brpInfoLabels.verbintenis,
      verbintenis,
      brpData
    );
  }

  return profileData;
}

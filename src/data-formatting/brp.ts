import { entries } from 'helpers/App';
import { BrpApiState } from 'hooks/api/api.brp';
import { defaultDateFormat } from '../helpers/App';

type Value = any;
type ProfileLabelValueFormatter =
  | string
  | [
      string | ((key: string, item: any, brpData?: BrpResponseData) => string),
      (value: any, item: any, brpData?: BrpResponseData) => Value
    ];

type ProfileLabels<T> = { [key in keyof T]: ProfileLabelValueFormatter };

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
  opgemaakteNaam: string;
  voornamen: string;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string;
}

interface Verbintenis {
  datumOntbinding: string | null;
  datumSluiting: string;
  landnaamSluiting: string;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
  persoon: Persoon;
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
  verbintenisHistorisch?: Verbintenis[];
  kinderen?: Kind[];
  ouders: Persoon[];
  adres: Adres;
  adresHistorisch?: Adres[];
}

export function getFullName(persoon: Persoon) {
  return persoon.opgemaakteNaam;
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
  overlijdensdatum: ['Datum overlijden', value => defaultDateFormat(value)],
  geboorteplaatsnaam: [
    'Geboorteplaats',
    (value, _item, brpResponseData) =>
      brpResponseData?.persoon.mokum ? value || 'Onbekend' : '',
  ],
  geboortelandnaam: [
    'Geboorteland',
    (value, _item, brpResponseData) =>
      brpResponseData?.persoon.mokum ? value || 'Onbekend' : '',
  ],
  nationaliteiten: [
    'Nationaliteit',
    value =>
      Array.isArray(value)
        ? value.map(({ omschrijving }) => omschrijving).join(' ')
        : null,
  ],
  bsn: 'BSN',
};

const adres: ProfileLabels<Partial<Adres>> = {
  straatnaam: [
    'Straat',
    (_value, _item, brpData) => {
      return !!brpData?.adres ? getFullAddress(brpData.adres) : 'Onbekend';
    },
  ],
  woonplaatsNaam: [
    'Plaats',
    (_value, _item, brpData) => {
      return !!brpData?.adres ? brpData.adres.woonplaatsNaam : 'Onbekend';
    },
  ],
  begindatumVerblijf: [
    'Sinds',
    value => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
};

function partner(key: keyof Persoon, defaultValue: Value = null) {
  return (_value: any, brpData?: BrpResponseData): Value => {
    return brpData?.verbintenis?.persoon[key] || defaultValue;
  };
}

const verbintenis: ProfileLabels<Partial<Verbintenis> & Partial<Persoon>> = {
  soortVerbintenisOmschrijving: [
    'Soort verbintenis',
    value => value || 'Onbekend',
  ],
  datumSluiting: [
    'Sinds',
    value => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
  datumOntbinding: [
    'Datum ontbinding',
    value => value && defaultDateFormat(value),
  ],
  plaatsnaamSluitingOmschrijving: ['Plaats', value => value || 'Onbekend'],
  landnaamSluiting: ['Land', value => value || 'Onbekend'],
  voornamen: ['Voornamen', partner('voornamen')],
  voorvoegselGeslachtsnaam: [
    'Voorvoegsel',
    partner('voorvoegselGeslachtsnaam'),
  ],
  geslachtsnaam: ['Achternaam', partner('geslachtsnaam')],
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
  bsn: ['BSN', partner('bsn')],
};

export const brpInfoLabels = {
  persoon,
  adres,
  verbintenis,
};

function format(
  labelConfig: ProfileLabels<any>,
  data: any,
  brpData: BrpResponseData
) {
  const formattedData = entries(labelConfig).reduce((acc, [key, formatter]) => {
    const labelFormatter = Array.isArray(formatter) ? formatter[0] : formatter;
    const label =
      typeof labelFormatter === 'function'
        ? labelFormatter(key, data, brpData)
        : labelFormatter;
    const value = Array.isArray(formatter)
      ? formatter[1](data[key], data, brpData)
      : data[key];
    return {
      ...acc,
      [label]: value,
    };
  }, {});

  return formattedData;
}

interface ProfileSection {
  [key: string]: Value;
}

interface BrpProfileData {
  persoon: ProfileSection;
  adres: ProfileSection;
  adresHistorisch?: ProfileSection[];
  verbintenis?: ProfileSection;
  verbintenisHistorisch?: ProfileSection[];
  ouders?: ProfileSection[];
  kinderen?: ProfileSection[];
}

export function formatBrpProfileData(brpData: BrpResponseData): BrpProfileData {
  const profileData: BrpProfileData = {
    persoon: format(brpInfoLabels.persoon, brpData.persoon, brpData),
    adres: format(brpInfoLabels.adres, brpData.adres, brpData),
  };

  if (brpData.verbintenis && !!brpData.verbintenis.soortVerbintenis) {
    profileData.verbintenis = {
      ...format(brpInfoLabels.verbintenis, brpData.verbintenis, brpData),
      ...format(brpInfoLabels.persoon, brpData.verbintenis.persoon, brpData),
    };
  }

  if (
    Array.isArray(brpData.verbintenisHistorisch) &&
    brpData.verbintenisHistorisch.length
  ) {
    const verbintenisHistorisch = brpData.verbintenisHistorisch.map(
      verbintenis => {
        return {
          ...format(brpInfoLabels.verbintenis, verbintenis, brpData),
          ...format(brpInfoLabels.persoon, verbintenis.persoon, brpData),
        };
      }
    );
    profileData.verbintenisHistorisch = verbintenisHistorisch;
  }

  if (Array.isArray(brpData.kinderen) && brpData.kinderen.length) {
    profileData.kinderen = brpData.kinderen.map(kind =>
      format(brpInfoLabels.persoon, kind, brpData)
    );
  }

  if (Array.isArray(brpData.ouders) && brpData.ouders.length) {
    profileData.ouders = brpData.ouders.map(ouder =>
      format(brpInfoLabels.persoon, ouder, brpData)
    );
  }

  if (
    Array.isArray(brpData.adresHistorisch) &&
    brpData.adresHistorisch.length
  ) {
    profileData.adresHistorisch = brpData.adresHistorisch.map(adres =>
      format(brpInfoLabels.adres, adres, brpData)
    );
  }

  return profileData;
}

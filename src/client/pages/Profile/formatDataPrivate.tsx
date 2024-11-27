import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  formatBirthdate,
  getFullAddress,
  hasDutchNationality,
} from '../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { entries } from '../../../universal/helpers/utils';
import {
  Adres,
  BRPData,
  Persoon,
  Verbintenis,
  VerbintenisHistorisch,
} from '../../../universal/types';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { Link } from '@amsterdam/design-system-react';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type Value = any;
type ProfileLabelValueFormatter =
  | string
  | [
      string | ((key: string, item: any, brpData?: BRPData) => string),
      (value: any, item: any, brpData?: BRPData) => Value,
    ];

type ProfileLabels<T> = { [key in keyof T]: ProfileLabelValueFormatter };

const persoon: ProfileLabels<Partial<Persoon>> = {
  voornamen: 'Voornamen',
  omschrijvingAdellijkeTitel: 'Titel',
  voorvoegselGeslachtsnaam: 'Voorvoegsel',
  geslachtsnaam: 'Achternaam',
  omschrijvingGeslachtsaanduiding: 'Geslacht',
  bsn: 'BSN',
  geboortedatum: [
    'Geboortedatum',
    (geboorteDatum, persoon) => {
      return persoon.indicatieGeboortedatum
        ? formatBirthdate(persoon.indicatieGeboortedatum, geboorteDatum)
        : defaultDateFormat(geboorteDatum);
    },
  ],
  overlijdensdatum: ['Datum overlijden', (value) => defaultDateFormat(value)],
  geboorteplaatsnaam: [
    'Geboorteplaats',
    (value, _item, BRPData) =>
      BRPData?.persoon.mokum ? value || 'Onbekend' : value,
  ],
  geboortelandnaam: [
    'Geboorteland',
    (value, _item, BRPData) =>
      BRPData?.persoon.mokum ? value || 'Onbekend' : value,
  ],
  nationaliteiten: [
    'Nationaliteit',
    (
      nationaliteiten: BRPData['persoon']['nationaliteiten'],
      _item,
      BRPData
    ) => {
      if (!BRPData) {
        return <>&mdash;</>;
      }
      if (hasDutchNationality(BRPData)) {
        return 'Nederlandse';
      }
      return nationaliteiten
        .map((nationaliteit) => nationaliteit.omschrijving)
        .join(', ');
    },
  ],
  omschrijvingBurgerlijkeStaat: [
    'Burgerlijke staat',
    (_value, _item, BRPData) => {
      return !BRPData?.verbintenis ? 'Ongehuwd' : undefined;
    },
  ],
  indicatieGeheim: [
    'Geheimhouding',
    (value, _item, BRPData) =>
      value ? (
        <>
          Voor dit adres geldt{' '}
          <Link
            variant={'inline'}
            href="https://www.amsterdam.nl/veelgevraagd/geheimhouding-persoonsgegevens-7ed1c"
          >
            geheimhouding
          </Link>
        </>
      ) : null,
  ],
};

const persoonSecundair: ProfileLabels<Partial<Persoon>> = {
  ...persoon,
};
persoonSecundair.geboorteplaatsnaam = 'Geboorteplaats';
persoonSecundair.geboortelandnaam = 'Geboorteland';

// Remove specific fields we don't want to show
delete persoonSecundair.omschrijvingGeslachtsaanduiding;
delete persoonSecundair.nationaliteiten;
delete persoonSecundair.indicatieGeheim;

const adres: ProfileLabels<Partial<Adres>> = {
  straatnaam: [
    'Straat',
    (_value, adres, brpData) => {
      return adres?.straatnaam ? getFullAddress(adres) : 'Onbekend';
    },
  ],
  woonplaatsNaam: [
    'Plaats',
    (_value, adres, brpData) => {
      return adres
        ? `${adres.postcode || ''} ${adres.woonplaatsNaam || 'Onbekend'}`
        : 'Onbekend';
    },
  ],
  begindatumVerblijf: [
    'Vanaf',
    (value) => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
  einddatumVerblijf: [
    'Tot',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  aantalBewoners: [
    'Aantal bewoners',
    (value, _item, brpData) => {
      return FeatureToggle.residentCountActive &&
        !!brpData?.adres?._adresSleutel ? (
        value === -1 ? (
          <LoadingContent barConfig={[['2rem', '2rem', '0']]} />
        ) : (
          value
        )
      ) : null;
    },
  ],
  wozWaarde: ['WOZ-waarde', (value, _item) => value],
};

function transformVerbintenisStatus(value: string) {
  const status: { [value: string]: string } = {
    Huwelijk: 'Gehuwd',
  };
  return status[value] || value;
}

const verbintenis: ProfileLabels<Partial<Verbintenis> & Partial<Persoon>> = {
  soortVerbintenisOmschrijving: [
    (_value, verbintenis) =>
      !verbintenis.datumOntbinding && !verbintenis.redenOntbindingOmschrijving
        ? 'Status'
        : 'Verbintenis',
    (value, verbintenis) =>
      !verbintenis.datumOntbinding ? transformVerbintenisStatus(value) : value,
  ],
  datumSluiting: ['Vanaf', (value) => !!value && defaultDateFormat(value)],
  datumOntbinding: [
    'Einddatum',
    (dateValue, verbintenis) => {
      if (dateValue) {
        return defaultDateFormat(dateValue);
      }
      if (verbintenis.redenOntbindingOmschrijving) {
        return 'Onbekend';
      }
      return null;
    },
  ],
  plaatsnaamSluitingOmschrijving: 'Plaats',
  landnaamSluiting: 'Land',
};

const verbintenisHistorisch: ProfileLabels<
  Partial<VerbintenisHistorisch> & Partial<Persoon>
> = {
  soortVerbintenisOmschrijving: verbintenis.soortVerbintenisOmschrijving,
  datumSluiting: verbintenis.datumSluiting,
  datumOntbinding: verbintenis.datumOntbinding,
  redenOntbindingOmschrijving: 'Reden',
  ...verbintenis,
};

export const brpInfoLabels = {
  persoon,
  persoonSecundair,
  adres,
  verbintenis,
  verbintenisHistorisch,
};

export function format<T, X>(labelConfig: X, data: any, profileData: T) {
  if (!data) {
    return data;
  }
  const formattedData = entries(labelConfig).reduce((acc, [key, formatter]) => {
    const labelFormatter = Array.isArray(formatter) ? formatter[0] : formatter;
    const label =
      typeof labelFormatter === 'function'
        ? labelFormatter(key, data, profileData)
        : labelFormatter;
    const value = Array.isArray(formatter)
      ? formatter[1](data[key], data, profileData)
      : data[key];

    // Don't display falsey values
    if (!value) {
      return acc;
    }

    return {
      ...acc,
      [label]: value,
    };
  }, {});

  return formattedData;
}

export interface ProfileSection {
  [key: string]: Value;
}

interface BrpProfileData {
  persoon: ProfileSection | null;
  adres: ProfileSection | null;
  adresHistorisch?: ProfileSection[];
  verbintenis?: ProfileSection;
  verbintenisHistorisch?: ProfileSection[];
  ouders?: ProfileSection[];
  kinderen?: ProfileSection[];
}

export function formatBrpProfileData(brpData: BRPData): BrpProfileData {
  const profileData: BrpProfileData = {
    persoon: format(brpInfoLabels.persoon, brpData.persoon, brpData),
    adres: brpData.adres
      ? format(brpInfoLabels.adres, brpData.adres, brpData)
      : { '': 'Adres onbekend' },
  };

  // Exclude below profile data for non-mokum residents.
  if (brpData?.persoon.mokum) {
    if (brpData.verbintenis && !!brpData.verbintenis.soortVerbintenis) {
      profileData.verbintenis = {
        ...format(brpInfoLabels.verbintenis, brpData.verbintenis, brpData),
        ...format(
          brpInfoLabels.persoonSecundair,
          brpData.verbintenis.persoon,
          brpData
        ),
      };
    }

    if (
      Array.isArray(brpData.verbintenisHistorisch) &&
      brpData.verbintenisHistorisch.length
    ) {
      const verbintenisHistorisch = brpData.verbintenisHistorisch.map(
        (verbintenis) => {
          return {
            ...format(
              brpInfoLabels.verbintenisHistorisch,
              verbintenis,
              brpData
            ),
            ...format(
              brpInfoLabels.persoonSecundair,
              verbintenis.persoon,
              brpData
            ),
          };
        }
      );
      profileData.verbintenisHistorisch = verbintenisHistorisch;
    }

    if (Array.isArray(brpData.kinderen) && brpData.kinderen.length) {
      profileData.kinderen = brpData.kinderen.map((kind) =>
        format(brpInfoLabels.persoonSecundair, kind, brpData)
      );
    }

    if (Array.isArray(brpData.ouders) && brpData.ouders.length) {
      profileData.ouders = brpData.ouders.map((ouder) =>
        format(brpInfoLabels.persoonSecundair, ouder, brpData)
      );
    }

    if (
      Array.isArray(brpData.adresHistorisch) &&
      brpData.adresHistorisch.length
    ) {
      profileData.adresHistorisch = brpData.adresHistorisch.map((adres) =>
        format(brpInfoLabels.adres, adres, brpData)
      );
    }
  }

  return profileData;
}

import React from 'react';
import {
  defaultDateFormat,
  entries,
  getFullAddress,
} from '../../../universal/helpers';
import {
  Adres,
  BRPData,
  Persoon,
  Verbintenis,
  VerbintenisHistorisch,
} from '../../../universal/types';
import { LinkdInline } from '../../components/index';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type Value = any;
type ProfileLabelValueFormatter =
  | string
  | [
      string | ((key: string, item: any, brpData?: BRPData) => string),
      (value: any, item: any, brpData?: BRPData) => Value
    ];

type ProfileLabels<T> = { [key in keyof T]: ProfileLabelValueFormatter };

const persoon: ProfileLabels<Partial<Persoon>> = {
  voornamen: 'Voornamen',
  omschrijvingAdellijkeTitel: 'Titel',
  voorvoegselGeslachtsnaam: 'Voorvoegsel',
  geslachtsnaam: 'Achternaam',
  omschrijvingGeslachtsaanduiding: 'Geslacht',
  bsn: 'BSN',
  geboortedatum: ['Geboortedatum', value => defaultDateFormat(value)],
  overlijdensdatum: ['Datum overlijden', value => defaultDateFormat(value)],
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
    value =>
      Array.isArray(value)
        ? value.map(({ omschrijving }) => omschrijving).join(' ')
        : null,
  ],
  indicatieGeheim: [
    'Geheimhouding',
    (value, _item, BRPData) =>
      value ? (
        <>
          Voor dit adres geldt{' '}
          <LinkdInline
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7B1833F1D4-05A2-4870-BDEE-20DC3A37ED1C%7D"
          >
            geheimhouding
          </LinkdInline>
        </>
      ) : null,
  ],
};

const persoonSecundair: ProfileLabels<Partial<Persoon>> = {
  ...persoon,
};
persoonSecundair.geboorteplaatsnaam = 'Geboorteplaats';
persoonSecundair.geboortelandnaam = 'Geboorteland';

const adres: ProfileLabels<Partial<Adres>> = {
  straatnaam: [
    'Straat',
    (_value, _item, brpData) => {
      return !!brpData?.adres?.straatnaam
        ? getFullAddress(brpData.adres)
        : 'Onbekend';
    },
  ],
  woonplaatsNaam: [
    'Plaats',
    (_value, _item, brpData) => {
      return !!brpData?.adres
        ? `${brpData.adres.postcode || ''} ${brpData.adres.woonplaatsNaam ||
            'Onbekend'}`
        : 'Onbekend';
    },
  ],
  begindatumVerblijf: [
    'Vanaf',
    value => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
};

function transformVerbintenisStatus(value: string) {
  const status: { [value: string]: string } = {
    Huwelijk: 'Gehuwd',
  };
  return status[value] || value;
}

const verbintenis: ProfileLabels<Partial<Verbintenis> & Partial<Persoon>> = {
  soortVerbintenisOmschrijving: [
    (_value, item) => (!item.datumOntbinding ? 'Status' : 'Verbintenis'),
    (value, item) =>
      !item.datumOntbinding ? transformVerbintenisStatus(value) : value,
  ],
  datumSluiting: ['Vanaf', value => !!value && defaultDateFormat(value)],
  datumOntbinding: [
    'Datum ontbinding',
    value => !!value && defaultDateFormat(value),
  ],
  plaatsnaamSluitingOmschrijving: 'Plaats',
  landnaamSluiting: 'Land',
};

const verbintenisHistorisch: ProfileLabels<Partial<VerbintenisHistorisch> &
  Partial<Persoon>> = {
  ...verbintenis,
  redenOntbindingOmschrijving: 'Reden ontbinding',
};

export const brpInfoLabels = {
  persoon,
  persoonSecundair,
  adres,
  verbintenis,
  verbintenisHistorisch,
};

export function format<T, X>(labelConfig: X, data: any, profileData: T) {
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
  persoon: ProfileSection;
  adres: ProfileSection;
  adresHistorisch?: ProfileSection[];
  verbintenis?: ProfileSection;
  verbintenisHistorisch?: ProfileSection[];
  ouders?: ProfileSection[];
  kinderen?: ProfileSection[];
}

export function formatBrpProfileData(brpData: BRPData): BrpProfileData {
  const profileData: BrpProfileData = {
    persoon: format(brpInfoLabels.persoon, brpData.persoon, brpData),
    adres: format(brpInfoLabels.adres, brpData.adres, brpData),
  };

  if (!!brpData?.persoon.mokum) {
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
        verbintenis => {
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
      profileData.kinderen = brpData.kinderen.map(kind =>
        format(brpInfoLabels.persoonSecundair, kind, brpData)
      );
    }

    if (Array.isArray(brpData.ouders) && brpData.ouders.length) {
      profileData.ouders = brpData.ouders.map(ouder =>
        format(brpInfoLabels.persoonSecundair, ouder, brpData)
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
  }

  return profileData;
}

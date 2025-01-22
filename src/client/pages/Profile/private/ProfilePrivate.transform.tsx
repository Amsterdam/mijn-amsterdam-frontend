import { Link } from '@amsterdam/design-system-react';

import styles from './ProfilePrivate.module.scss';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import {
  formatBirthdate,
  getFullAddress,
  hasDutchNationality,
  isMokum,
} from '../../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import {
  Adres,
  AppState,
  BRPData,
  Persoon,
  VerbintenisHistorisch,
} from '../../../../universal/types';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { ExternalUrls } from '../../../config/external-urls';
import {
  ProfileLabels,
  formatProfileSectionData,
} from '../profileDataFormatter';
import {
  ActionLink,
  PanelConfig,
  ProfileSectionData,
} from '../ProfileSectionPanel';
/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type BRPPanelKey = keyof Omit<
  BRPData,
  | 'identiteitsbewijzen'
  | 'notifications'
  | 'kvkNummer'
  | 'fetchUrlAantalBewoners'
>;

const persoon: ProfileLabels<Partial<Persoon>, AppState['BRP']['content']> = {
  voornamen: 'Voornamen',
  omschrijvingAdellijkeTitel: 'Titel',
  voorvoegselGeslachtsnaam: 'Voorvoegsel',
  geslachtsnaam: 'Achternaam',
  omschrijvingGeslachtsaanduiding: 'Geslacht',
  bsn: 'BSN',
  geboortedatum: [
    'Geboortedatum',
    (geboorteDatum, persoon) => {
      if (typeof geboorteDatum === 'string') {
        return persoon.indicatieGeboortedatum
          ? formatBirthdate(persoon.indicatieGeboortedatum, geboorteDatum)
          : defaultDateFormat(geboorteDatum);
      }
      return '';
    },
  ],
  overlijdensdatum: [
    'Datum overlijden',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
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
    (nationaliteiten, _item, BRPData) => {
      if (!BRPData) {
        return <>&mdash;</>;
      }
      if (hasDutchNationality(BRPData)) {
        return 'Nederlandse';
      }
      return nationaliteiten
        ?.map((nationaliteit) => nationaliteit.omschrijving)
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
    (value, _item) =>
      value ? (
        <>
          Voor dit adres geldt{' '}
          <Link
            rel="noopener noreferrer"
            href="https://www.amsterdam.nl/veelgevraagd/geheimhouding-persoonsgegevens-7ed1c"
          >
            geheimhouding
          </Link>
        </>
      ) : null,
  ],
};

const persoonSecundair: ProfileLabels<
  Partial<Persoon>,
  AppState['BRP']['content']
> = {
  ...persoon,
};
persoonSecundair.geboorteplaatsnaam = 'Geboorteplaats';
persoonSecundair.geboortelandnaam = 'Geboorteland';

// Remove specific fields we don't want to show
delete persoonSecundair.omschrijvingGeslachtsaanduiding;
delete persoonSecundair.nationaliteiten;
delete persoonSecundair.indicatieGeheim;

const adres: ProfileLabels<Partial<Adres>, AppState['BRP']['content']> = {
  straatnaam: [
    'Straat',
    (_value, adres) => {
      return adres?.straatnaam ? getFullAddress(adres as Adres) : 'Onbekend';
    },
  ],
  woonplaatsNaam: [
    'Plaats',
    (_value, adres) => {
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
      if (
        FeatureToggle.residentCountActive &&
        !!brpData?.adres?._adresSleutel
      ) {
        return value === -1 ? (
          <LoadingContent barConfig={[['2rem', '2rem', '0']]} />
        ) : (
          value
        );
      }
      return null;
    },
  ],
  wozWaarde: 'WOZ-waarde',
};

function transformVerbintenisStatus(value: string) {
  const status: { [value: string]: string } = {
    Huwelijk: 'Gehuwd',
  };
  return status[value] || value;
}

const verbintenis: ProfileLabels<
  Partial<VerbintenisHistorisch>,
  AppState['BRP']['content']
> = {
  soortVerbintenisOmschrijving: [
    (verbintenis) =>
      !verbintenis.datumOntbinding && !verbintenis.redenOntbindingOmschrijving
        ? 'Status'
        : 'Verbintenis',
    (value, verbintenis) =>
      !verbintenis.datumOntbinding && typeof value === 'string'
        ? transformVerbintenisStatus(value)
        : value,
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
  Partial<VerbintenisHistorisch>,
  AppState['BRP']['content']
> = {
  soortVerbintenisOmschrijving: verbintenis.soortVerbintenisOmschrijving!,
  datumSluiting: verbintenis.datumSluiting!,
  plaatsnaamSluitingOmschrijving: 'Plaats',
  landnaamSluiting: 'Land',
  redenOntbindingOmschrijving: 'Reden',
  datumOntbinding: verbintenis.datumOntbinding!,
};

const labelConfig = {
  persoon,
  persoonSecundair,
  adres,
  verbintenis,
  verbintenisHistorisch,
};

export interface BrpProfileData {
  persoon: ProfileSectionData | null;
  adres: ProfileSectionData | null;
  adresHistorisch?: ProfileSectionData[];
  verbintenis?: ProfileSectionData;
  verbintenisHistorisch?: ProfileSectionData[];
  ouders?: ProfileSectionData[];
  kinderen?: ProfileSectionData[];
}

export function formatBrpProfileData(brpData: BRPData): BrpProfileData {
  const profileData: BrpProfileData = {
    persoon: formatProfileSectionData(
      labelConfig.persoon,
      brpData?.persoon,
      brpData
    ),
    adres: brpData.adres
      ? formatProfileSectionData(labelConfig.adres, brpData.adres, brpData)
      : { '': 'Adres onbekend' },
  };

  // Exclude below profile data for non-mokum residents.
  if (brpData.persoon.mokum) {
    if (brpData.verbintenis && !!brpData.verbintenis.soortVerbintenis) {
      profileData.verbintenis = {
        ...formatProfileSectionData(
          labelConfig.verbintenis,
          brpData.verbintenis,
          brpData
        ),
        ...formatProfileSectionData(
          labelConfig.persoonSecundair,
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
            ...formatProfileSectionData(
              labelConfig.verbintenisHistorisch,
              verbintenis,
              brpData
            ),
            ...formatProfileSectionData(
              labelConfig.persoonSecundair,
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
        formatProfileSectionData(labelConfig.persoonSecundair, kind, brpData)
      );
    }

    if (Array.isArray(brpData.ouders) && brpData.ouders.length) {
      profileData.ouders = brpData.ouders.map((ouder) =>
        formatProfileSectionData(labelConfig.persoonSecundair, ouder, brpData)
      );
    }

    if (
      Array.isArray(brpData.adresHistorisch) &&
      brpData.adresHistorisch.length
    ) {
      profileData.adresHistorisch = brpData.adresHistorisch.map((adres) =>
        formatProfileSectionData(labelConfig.adres, adres, brpData)
      );
    }
  }

  return profileData;
}

export const panelConfig: PanelConfig<BRPPanelKey, AppState['BRP']> = {
  persoon: (BRP) => {
    const actionLinks = [];

    if (isMokum(BRP.content)) {
      actionLinks.push({
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      });
    }

    return {
      title: 'Persoonlijke gegevens',
      actionLinks,
    };
  },
  adres: (BRP) => {
    const title = isMokum(BRP.content)
      ? 'Verhuizing doorgeven'
      : 'Verhuizing naar Amsterdam doorgeven';

    const actionLinks: ActionLink[] = [
      {
        title,
        url: ExternalUrls.REPORT_RELOCATION,
        external: true,
      },
    ];

    if (
      FeatureToggle.residentCountActive &&
      !!BRP.content?.adres?._adresSleutel &&
      BRP.content?.adres?.landnaam === 'Nederland'
    ) {
      actionLinks.push({
        title: 'Onjuiste inschrijving melden',
        url: ExternalUrls.CHANGE_RESIDENT_COUNT,
        external: true,
        className: styles['ActionLink--reportIncorrectResidentCount'],
      });
    }

    return {
      title: 'Adres',
      actionLinks,
    };
  },
  verbintenis: (BRP) => ({
    title: 'Burgerlijke staat',
    actionLinks: isMokum(BRP.content)
      ? [
          {
            title: 'Inzien of correctie doorgeven',
            url: ExternalUrls.CHANGE_PERSONAL_DATA,
            external: true,
          },
        ]
      : [],
  }),
  verbintenisHistorisch: (BRP) => ({
    title: 'Eerdere huwelijken of partnerschappen',
    actionLinks: isMokum(BRP.content)
      ? [
          {
            title: 'Inzien of correctie doorgeven',
            url: ExternalUrls.CHANGE_PERSONAL_DATA,
            external: true,
          },
        ]
      : [],
  }),
  ouders: () => ({
    title: 'Ouders',
    actionLinks: [],
  }),
  kinderen: (BRP) => ({
    title: 'Kinderen',
    actionLinks: isMokum(BRP.content)
      ? [
          {
            title: 'Inzien of correctie doorgeven',
            url: ExternalUrls.CHANGE_PERSONAL_DATA,
            external: true,
          },
        ]
      : [],
  }),
  adresHistorisch: () => ({
    title: 'Vorige adressen',
    actionLinks: [],
  }),
};

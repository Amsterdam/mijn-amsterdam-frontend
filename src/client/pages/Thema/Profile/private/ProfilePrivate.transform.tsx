import { Link } from '@amsterdam/design-system-react';

import styles from './ProfilePrivate.module.scss';
import type { Persoon } from '../../../../../server/services/brp/brp-types';
import type { Adres } from '../../../../../server/services/brp/brp-types';
import type {
  BRPData,
  VerbintenisHistorisch,
} from '../../../../../server/services/profile/brp.types';
import { FeatureToggle } from '../../../../../universal/config/feature-toggles';
import {
  formatBirthdate,
  getFullAddress,
  hasDutchNationality,
  isMokum,
} from '../../../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import type { AppState } from '../../../../../universal/types/App.types';
import LoadingContent from '../../../../components/LoadingContent/LoadingContent';
import { featureToggle, profileLinks } from '../Profile-thema-config';
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
  bsn: 'BSN',
  voornamen: 'Voornamen',
  omschrijvingAdellijkeTitel: 'Titel',
  voorvoegselGeslachtsnaam: 'Voorvoegsel',
  geslachtsnaam: 'Achternaam',
  omschrijvingGeslachtsaanduiding: 'Geslacht',
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
  geboortedatumFormatted: 'Geboortedatum',
  overlijdensdatum: [
    'Datum overlijden',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  overlijdensdatumFormatted: 'Datum overlijden',
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
  omschrijvingBurgerlijkeStaat: 'Burgerlijke staat',
  indicatieGeheim: [
    'Geheimhouding',
    (value, _item) =>
      value ? (
        <>
          <Link
            rel="noopener noreferrer"
            href="https://www.amsterdam.nl/burgerzaken/geheimhouding-persoonsgegevens-aanvragen/"
          >
            Uw gegevens worden niet aan maatschappelijke instellingen
            doorgegeven
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
  geboorteplaatsnaam: 'Geboorteplaats',
  geboortelandnaam: 'Geboorteland',
};

// Remove specific fields we don't want to show
delete persoonSecundair.omschrijvingGeslachtsaanduiding;
delete persoonSecundair.nationaliteiten;
delete persoonSecundair.indicatieGeheim;

const adres: ProfileLabels<
  Partial<Adres> & { aantalBewoners: number; wozWaarde: string },
  AppState['BRP']['content']
> = {
  locatiebeschrijving: 'Locatie',
  straatnaam: [
    'Straat',
    (_value, adres) => {
      if (!adres?.straatnaam && adres?.locatiebeschrijving) {
        return null;
      }
      return adres?.straatnaam ? getFullAddress(adres as Adres) : 'Onbekend';
    },
  ],
  woonplaatsNaam: [
    'Plaats',
    (_value, adres) => {
      if (
        !(adres?.postcode || adres?.woonplaatsNaam) &&
        adres?.locatiebeschrijving
      ) {
        return null;
      }
      return adres
        ? `${adres.postcode || ''} ${adres.woonplaatsNaam || 'Onbekend'}`
        : 'Onbekend';
    },
  ],
  begindatumVerblijf: [
    'Vanaf',
    (value) => (value ? defaultDateFormat(value) : 'Onbekend'),
  ],
  begindatumVerblijfFormatted: 'Vanaf',
  /** @deprecated */
  einddatumVerblijf: [
    'Tot',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  /** @deprecated */
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

/** @deprecated */
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
  /** @deprecated */
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
  /** @deprecated */
  datumSluiting: [
    'Vanaf',
    (value) => {
      if (featureToggle.BRP.benkBrpServiceActive) {
        return null;
      }
      return !!value && defaultDateFormat(value);
    },
  ],
  datumSluitingFormatted: 'Geregistreerd op',
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
  datumOntbindingFormatted: 'Einddatum',
  /** @deprecated */
  plaatsnaamSluitingOmschrijving: 'Plaats',
  /** @deprecated */
  landnaamSluiting: 'Land',
};

/** @deprecated */
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
  verbintenis?: ProfileSectionData;
  ouders?: ProfileSectionData[];
  kinderen?: ProfileSectionData[];
  /** @deprecated */
  adresHistorisch?: ProfileSectionData[];
  /** @deprecated */
  verbintenisHistorisch?: ProfileSectionData[];
}

export function formatBrpProfileData(brpData: BRPData): BrpProfileData {
  const profileData: BrpProfileData = {
    persoon: formatProfileSectionData(
      labelConfig.persoon,
      brpData?.persoon,
      brpData
    ),
    adres:
      brpData.adres?.straatnaam || brpData.adres?.locatiebeschrijving
        ? formatProfileSectionData(labelConfig.adres, brpData.adres, brpData)
        : { Gegevens: 'onbekend' },
  };

  if (!brpData.persoon.mokum) {
    return profileData;
  }

  if (brpData.verbintenis) {
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

  /** @deprecated */
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

  /** @deprecated */
  if (
    Array.isArray(brpData.adresHistorisch) &&
    brpData.adresHistorisch.length
  ) {
    profileData.adresHistorisch = brpData.adresHistorisch.map((adres) =>
      formatProfileSectionData(labelConfig.adres, adres, brpData)
    );
  }

  return profileData;
}

export const panelConfig: PanelConfig<BRPPanelKey, AppState['BRP']> = {
  persoon: (BRP) => {
    const actionLinks = [];

    if (isMokum(BRP.content)) {
      actionLinks.push({
        title: 'Inzien of correctie doorgeven',
        url: profileLinks.CHANGE_PERSONAL_DATA,
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
        url: profileLinks.REPORT_RELOCATION,
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
        url: profileLinks.CHANGE_RESIDENT_COUNT,
        external: true,
        className: styles['ActionLink--reportIncorrectResidentCount'],
      });
    }
    const contentAfterTheTitle = isMokum(BRP.content) ? (
      <>
        Uw huis verduurzamen? De gemeente biedt subsidies of gratis hulp. Bekijk{' '}
        <Link rel="noopener noreferrer" href="https://duurzaamwonen.amsterdam/">
          duurzaamwonen.amsterdam
        </Link>{' '}
        voor meer informatie.
      </>
    ) : null;

    return {
      title: 'Adres',
      contentAfterTheTitle,
      actionLinks,
    };
  },
  verbintenis: (BRP: AppState['BRP']) => ({
    title: featureToggle.BRP.benkBrpServiceActive
      ? BRP.content?.verbintenis?.datumOntbinding
        ? 'Eerder huwelijk of partnerschap'
        : 'Partner'
      : 'Burgerlijke staat',
    actionLinks: isMokum(BRP.content)
      ? [
          {
            title: 'Inzien of correctie doorgeven',
            url: profileLinks.CHANGE_PERSONAL_DATA,
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
            url: profileLinks.CHANGE_PERSONAL_DATA,
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
            url: profileLinks.CHANGE_PERSONAL_DATA,
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

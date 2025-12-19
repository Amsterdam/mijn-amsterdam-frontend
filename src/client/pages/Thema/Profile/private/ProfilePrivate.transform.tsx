import { Link } from '@amsterdam/design-system-react';

import styles from './ProfilePrivate.module.scss';
import type {
  BrpFrontend,
  Persoon,
  Verbintenis,
} from '../../../../../server/services/brp/brp-types';
import type { Adres } from '../../../../../server/services/brp/brp-types';
import {
  getFullAddress,
  hasDutchNationality,
  isMokum,
} from '../../../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import type { AppState } from '../../../../../universal/types/App.types';
import LoadingContent from '../../../../components/LoadingContent/LoadingContent';
import {
  BRP_LABEL_AANTAL_BEWONERS,
  featureToggle,
  profileLinks,
  themaIdBRP,
} from '../Profile-thema-config';
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
  BrpFrontend,
  | 'notifications'
  | 'kvknummer'
  | 'fetchUrlAantalBewoners'
  | 'aantalBewoners'
  | 'bsnTranslation'
>;

const persoon: ProfileLabels<Partial<Persoon>, AppState['BRP']['content']> = {
  bsn: 'BSN',
  voornamen: 'Voornamen',
  omschrijvingAdellijkeTitel: 'Titel',
  voorvoegselGeslachtsnaam: 'Voorvoegsel',
  geslachtsnaam: 'Achternaam',
  omschrijvingGeslachtsaanduiding: 'Geslacht',
  geboortedatumFormatted: 'Geboortedatum',
  overlijdensdatum: [
    'Datum overlijden',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  overlijdensdatumFormatted: 'Datum overlijden',
  geboorteplaatsnaam: [
    'Geboorteplaats',
    (value, _item, brpData) =>
      brpData?.persoon.mokum ? value || 'Onbekend' : value,
  ],
  geboortelandnaam: [
    'Geboorteland',
    (value, _item, brpData) =>
      brpData?.persoon.mokum ? value || 'Onbekend' : value,
  ],
  nationaliteiten: [
    'Nationaliteit',
    (nationaliteiten, _item, brpData) => {
      if (!brpData) {
        return <>&mdash;</>;
      }
      if (hasDutchNationality(brpData)) {
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
  Partial<Adres> & { aantalBewoners: number },
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
  aantalBewoners: [
    BRP_LABEL_AANTAL_BEWONERS,
    (value, _x, BRPContent) => {
      if (
        BRPContent?.persoon?.mokum === true &&
        featureToggle[themaIdBRP].aantalBewonersOpAdresTonenActive
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
  wozWaarde: [
    'WOZ-waarde',
    () => {
      return (
        <>
          Te vinden op{' '}
          <Link rel="noopener noreferrer" href="https://www.wozwaardeloket.nl/">
            WOZ-waardeloket
          </Link>
        </>
      );
    },
  ],
};

const verbintenis: ProfileLabels<
  Partial<Verbintenis>,
  AppState['BRP']['content']
> = {
  datumSluitingFormatted: 'Geregistreerd op',
  datumOntbinding: [
    'Einddatum',
    (dateValue) => {
      if (dateValue) {
        return defaultDateFormat(dateValue);
      }
      return null;
    },
  ],
  datumOntbindingFormatted: 'Einddatum',
};

const labelConfig = {
  persoon,
  persoonSecundair,
  adres,
  verbintenis,
};

export interface BrpProfileData {
  adres: ProfileSectionData | null;
  adresHistorisch?: ProfileSectionData[];
  kinderen?: ProfileSectionData[];
  ouders?: ProfileSectionData[];
  persoon: ProfileSectionData | null;
  verbintenis?: ProfileSectionData;
}

export function formatBrpProfileData(brpData: BrpFrontend): BrpProfileData {
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

  return profileData;
}

export const panelConfig: PanelConfig<
  BRPPanelKey,
  AppState['BRP'],
  BrpProfileData
> = {
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
  adres: (BRP, profileData) => {
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

    if (profileData.adres?.[BRP_LABEL_AANTAL_BEWONERS]) {
      actionLinks.push({
        title: 'Onjuiste inschrijving melden',
        url: profileLinks.CHANGE_RESIDENT_COUNT,
        external: true,
        className: styles['ActionLink--reportIncorrectResidentCount'],
      });
    }
    const contentAfterTheTitle = isMokum(BRP.content) ? (
      <>
        <strong>Uw huis verduurzamen?</strong> De gemeente biedt subsidies of
        gratis hulp.
        <br /> Bekijk{' '}
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

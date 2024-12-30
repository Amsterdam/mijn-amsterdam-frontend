import styles from './Profile.module.scss';
import type { KVKData } from '../../../server/services/kvk';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { isMokum } from '../../../universal/helpers/brp';
import { BRPData } from '../../../universal/types';
import {
  ActionLink,
  InfoPanelProps,
} from '../../components/InfoPanel/InfoPanel';
import { ExternalUrls } from '../../config/app';

type BRPPanelKey = keyof Omit<
  BRPData,
  'identiteitsbewijzen' | 'notifications' | 'kvkNummer'
>;

type KVKPanelKey = keyof Omit<KVKData, 'mokum'> | 'hoofdVestiging';

type PanelProps = Pick<InfoPanelProps, 'title' | 'actionLinks'>;

export type PanelConfigFormatter =
  | PanelProps
  | ((panelData: any) => PanelProps);

type PanelConfig<T extends string> = {
  [key in T]: PanelConfigFormatter;
};

export const panelConfig: PanelConfig<BRPPanelKey> = {
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
  contactmomenten: { title: 'Contactmomenten', actionLinks: [] },
  fetchUrlAantalBewoners: { title: 'Aantal bewoners', actionLinks: [] },
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
  ouders: {
    title: 'Ouders',
    actionLinks: [],
  },
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
  adresHistorisch: {
    title: 'Vorige adressen',
    actionLinks: [],
  },
};

export const panelConfigCommercial: PanelConfig<KVKPanelKey> = {
  onderneming: (KVK) => ({
    title: 'Onderneming',
    actionLinks: [],
  }),
  rechtspersonen: (KVK) => ({
    title:
      KVK.content?.rechtspersonen.length &&
      KVK.content.rechtspersonen.length > 1
        ? 'Rechtspersonen'
        : 'Rechtspersoon',
    actionLinks: [],
  }),
  hoofdVestiging: (KVK) => ({
    title: 'Hoofdvestiging',
    actionLinks: [],
  }),
  vestigingen: (KVK) => ({
    title: KVK.content.vestigingen.length > 1 ? 'Vestigingen' : 'Vestiging',
    actionLinks: [],
  }),
  aandeelhouders: (KVK) => ({
    title:
      KVK.content?.aandeelhouders.length &&
      KVK.content.aandeelhouders.length > 1
        ? 'Aandeelhouders'
        : 'Aandeelhouder',
    actionLinks: [],
  }),
  bestuurders: (KVK) => ({
    title:
      KVK.content?.bestuurders.length && KVK.content.bestuurders.length > 1
        ? 'Bestuurders'
        : 'Bestuurder',
    actionLinks: [],
  }),
  overigeFunctionarissen: (KVK) => ({
    title:
      KVK.content?.overigeFunctionarissen.length &&
      KVK.content.overigeFunctionarissen.length > 1
        ? 'Overige functionarissen'
        : 'Overige functionaris',
    actionLinks: [],
  }),
  gemachtigden: () => ({
    title: 'Gemachtigde',
    actionLinks: [],
  }),
  aansprakelijken: () => ({
    title: 'Aansprakelijke',
    actionLinks: [],
  }),
  eigenaar: () => ({
    title: 'Eigenaar',
    actionLinks: [],
  }),
};

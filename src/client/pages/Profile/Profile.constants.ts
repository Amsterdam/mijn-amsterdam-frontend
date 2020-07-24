import {
  ActionLink,
  InfoPanelProps,
} from '../../components/InfoPanel/InfoPanel';

import { isMokum } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { ExternalUrls } from '../../config/app';
import { KVKData } from '../../../server/services/kvk';

type BRPPanelKey = keyof Omit<
  BRPData,
  'identiteitsbewijzen' | 'notifications' | 'kvkNummer'
>;

type KVKPanelKey = keyof Omit<KVKData, 'mokum'>;

type PanelProps = Pick<InfoPanelProps, 'title' | 'actionLinks'>;

export type PanelConfigFormatter =
  | PanelProps
  | ((panelData: any) => PanelProps);

type PanelConfig<T extends string> = {
  [key in T]: PanelConfigFormatter;
};

export const panelConfig: PanelConfig<BRPPanelKey> = {
  persoon: BRP => ({
    title: 'Persoonlijke gegevens',
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
  adres: BRP => {
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
    return {
      title: 'Woonadres',
      actionLinks,
    };
  },
  verbintenis: BRP => ({
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
  verbintenisHistorisch: BRP => ({
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
  kinderen: BRP => ({
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
    title: 'Vorige woonadressen',
    actionLinks: [],
  },
};

export const panelConfigCommercial: PanelConfig<KVKPanelKey> = {
  onderneming: KVK => ({
    title: 'Onderneming',
    actionLinks: isMokum(KVK.content)
      ? [
          {
            title: 'Inzien of correctie doorgeven',
            url: ExternalUrls.CHANGE_PERSONAL_DATA,
            external: true,
          },
        ]
      : [],
  }),
  rechtspersonen: KVK => ({
    title: 'Rechtspersonen',
    actionLinks: [],
  }),
  vestigingen: KVK => ({
    title: 'Vestigingen',
    actionLinks: [],
  }),
  aandeelhouders: KVK => ({
    title: 'Aandeelhouders',
    actionLinks: [],
  }),
  bestuurders: KVK => ({
    title: 'Bestuurders',
    actionLinks: [],
  }),
};

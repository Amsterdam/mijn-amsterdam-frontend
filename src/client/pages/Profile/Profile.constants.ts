import {
  ActionLink,
  InfoPanelProps,
} from '../../components/InfoPanel/InfoPanel';

import { isMokum } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { AppState } from '../../AppState';
import { ExternalUrls } from '../../config/app';

type PanelKey = keyof Omit<
  BRPData,
  'identiteitsbewijzen' | 'notifications' | 'kvkNummer'
>;
type PanelProps = Pick<InfoPanelProps, 'title' | 'actionLinks'>;

export type PanelConfigFormatter =
  | PanelProps
  | ((brpData: AppState['BRP']) => PanelProps);

type PanelConfig = {
  [key in PanelKey]: PanelConfigFormatter;
};

export const panelConfig: PanelConfig = {
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

import {
  ActionLink,
  InfoPanelProps,
} from '../../components/InfoPanel/InfoPanel';

import { BRPData } from '../../../server/services/brp';
import { ExternalUrls } from '../../../universal/config';
import { ServicesRelatedData } from '../../hooks/api/api.services-related';
import { isMokum } from './formatData';

type PanelKey = keyof BRPData | 'adresHistorisch' | 'verbintenisHistorisch';
type PanelProps = Pick<InfoPanelProps, 'title' | 'actionLinks'>;

export type PanelConfigFormatter =
  | PanelProps
  | ((brpData: ServicesRelatedData['BRP']) => PanelProps);

type PanelConfig = {
  [key in PanelKey]: PanelConfigFormatter;
};

export const panelConfig: PanelConfig = {
  persoon: BRP => ({
    title: 'Persoonlijke gegevens',
    actionLinks: isMokum(BRP)
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
    const title = isMokum(BRP)
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
    actionLinks: isMokum(BRP)
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
    title: 'Voormalige verbintenissen',
    actionLinks: isMokum(BRP)
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
    actionLinks: isMokum(BRP)
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

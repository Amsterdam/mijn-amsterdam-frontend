import { ExternalUrls } from 'App.constants';
import { InfoPanelProps } from 'components/InfoPanel/InfoPanel';
import { BrpKey } from 'hooks/api/api.brp';

export const panelConfig: {
  [key in BrpKey]: Pick<InfoPanelProps, 'title' | 'actionLinks'>;
} = {
  persoon: {
    title: 'Persoonlijke gegevens',
    actionLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      },
    ],
  },
  adres: {
    title: 'Woonadres',
    actionLinks: [
      {
        title: 'Verhuizing doorgeven',
        url: ExternalUrls.REPORT_RELOCATION,
        external: true,
      },
    ],
  },
  verbintenis: {
    title: 'Burgerlijke staat',
    actionLinks: [
      {
        title: 'Inzien of correctie doorgeven',
        url: ExternalUrls.CHANGE_PERSONAL_DATA,
        external: true,
      },
    ],
  },
  ouders: {
    title: 'Ouders',
    actionLinks: [],
  },
  kinderen: {
    title: 'Kinderen',
    actionLinks: [],
  },
};

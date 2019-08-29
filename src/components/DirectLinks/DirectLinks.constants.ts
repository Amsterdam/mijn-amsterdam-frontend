import { AppRoutes, ExternalUrls } from 'App.constants';
export type DirectLinkType =
  | 'MIJN_SUBSIDIE'
  | 'MIJN_OVERHEID_BERICHTEBOX'
  | 'MY_AREA'
  | 'MY_TIPS';

export interface DirectLink {
  title: string;
  url: string;
  isPhoneScreenLink?: true;
  isExternalLink?: true;
  id?: string;
}

export const LINKS: { [key in DirectLinkType]: DirectLink } = {
  MY_AREA: {
    title: 'Mijn buurt',
    url: AppRoutes.MY_AREA,
    isPhoneScreenLink: true,
    id: 'MyAreaHeader',
  },
  MY_TIPS: {
    title: 'Mijn tips',
    url: AppRoutes.MY_TIPS,
    isPhoneScreenLink: true,
    id: 'MyTipsHeader',
  },
  MIJN_OVERHEID_BERICHTEBOX: {
    title: 'Mijn Overheid Berichtenbox',
    url: ExternalUrls.BERICHTENBOX,
    isExternalLink: true,
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn Subsidies',
    url: ExternalUrls.MIJN_SUBSIDIES,
    isExternalLink: true,
  },
};

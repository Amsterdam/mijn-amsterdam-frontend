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
}

export const LINKS: { [key in DirectLinkType]: DirectLink } = {
  MY_TIPS: {
    title: 'Mijn tips',
    url: AppRoutes.MY_TIPS,
    isPhoneScreenLink: true,
  },
  MY_AREA: {
    title: 'Mijn buurt',
    url: AppRoutes.MY_AREA,
    isPhoneScreenLink: true,
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

import { AppRoutes, ExternalUrls } from 'App.constants';
export type DirectLinkType =
  | 'MIJN_SUBSIDIE'
  | 'MIJN_WERK_EN_INKOMEN'
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
  MIJN_WERK_EN_INKOMEN: {
    title: 'Mijn Werk en Inkomen',
    url: ExternalUrls.MIJN_WERK_EN_INKOMEN,
    isExternalLink: true,
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn subsidies',
    url: ExternalUrls.MIJN_SUBSIDIES,
    isExternalLink: true,
  },
};

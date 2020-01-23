import { ExternalUrls } from 'config/App.constants';
import { AppRoutes } from 'config/Routing.constants';

export type DirectLinkType =
  | 'MIJN_SUBSIDIE'
  | 'MIJN_OVERHEID_BERICHTEBOX'
  | 'MIJN_BUURT'
  | 'FAQ'
  | 'AMSTERDAM'
  | 'MIJN_TIPS';

export interface DirectLink {
  title: string;
  url: string;
  isPhoneScreenLink?: true;
  isExternalLink?: true;
  id?: string;
}

export const LINKS: { [key in DirectLinkType]: DirectLink } = {
  MIJN_BUURT: {
    title: 'Mijn buurt',
    url: AppRoutes.MIJN_BUURT,
    isPhoneScreenLink: true,
    id: 'MyAreaHeader',
  },
  MIJN_TIPS: {
    title: 'Mijn tips',
    url: AppRoutes.MIJN_TIPS,
    isPhoneScreenLink: true,
    id: 'MyTipsHeader',
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn Subsidies',
    url: ExternalUrls.MIJN_SUBSIDIES,
    isExternalLink: true,
  },
  FAQ: {
    title: 'Veelgestelde vragen',
    url: ExternalUrls.MIJN_AMSTERDAM_VEELGEVRAAGD,
    isExternalLink: true,
  },
  MIJN_OVERHEID_BERICHTEBOX: {
    title: 'Mijn Overheid Berichtenbox',
    url: ExternalUrls.BERICHTENBOX,
    isExternalLink: true,
  },
  AMSTERDAM: {
    title: 'Amsterdam.nl',
    url: ExternalUrls.AMSTERDAM,
    isExternalLink: true,
  },
};

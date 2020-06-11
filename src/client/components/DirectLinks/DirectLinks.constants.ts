import { AppRoutes } from '../../../universal/config';
import { ExternalUrls } from '../../config/app';

export type DirectLinkType =
  | 'MIJN_SUBSIDIE'
  | 'MIJN_OVERHEID_BERICHTEBOX'
  | 'BUURT'
  | 'FAQ'
  | 'AMSTERDAM'
  | 'TIPS';

export interface DirectLink {
  title: string;
  url: string;
  isPhoneScreenLink?: true;
  isExternalLink?: true;
  id?: string;
}

export const LINKS: { [key in DirectLinkType]: DirectLink } = {
  BUURT: {
    title: 'Mijn buurt',
    url: AppRoutes.BUURT,
    isPhoneScreenLink: true,
    id: 'MyAreaHeader',
  },
  TIPS: {
    title: 'Mijn tips',
    url: AppRoutes.TIPS,
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

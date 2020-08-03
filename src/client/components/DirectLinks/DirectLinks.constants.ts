import { AppRoutes } from '../../../universal/config';
import { ExternalUrls } from '../../config/app';
import { FeatureToggle } from '../../../universal/config/app';

export interface DirectLink {
  title: string;
  url?: string;
  isPhoneScreenLink?: true;
  isExternalLink?: true;
  id?: string;
  isActive: boolean;
}

export const LINKS: Record<string, DirectLink> = {
  BUURT: {
    title: 'Mijn buurt',
    url: AppRoutes.BUURT,
    isPhoneScreenLink: true,
    id: 'MyAreaHeader',
    isActive: true,
  },
  TIPS: {
    title: 'Mijn tips',
    url: AppRoutes.TIPS,
    isPhoneScreenLink: true,
    id: 'MyTipsHeader',
    isActive: true,
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn Subsidies',
    url: ExternalUrls.MIJN_SUBSIDIES,
    isExternalLink: true,
    isActive: true,
  },
  KREFIA: {
    title: 'Kredietbank en FIBU Amsterdam',
    url: ExternalUrls.KREFIA,
    isExternalLink: true,
    isActive: FeatureToggle.KrefiaDirectLinkActive,
  },
  FAQ: {
    title: 'Veelgestelde vragen',
    url: ExternalUrls.MIJN_AMSTERDAM_VEELGEVRAAGD,
    isExternalLink: true,
    isActive: true,
  },
  MIJN_OVERHEID_BERICHTEBOX: {
    title: 'Mijn Overheid Berichtenbox',
    url: ExternalUrls.BERICHTENBOX,
    isExternalLink: true,
    isActive: true,
  },
  AMSTERDAM: {
    title: 'Amsterdam.nl',
    url: ExternalUrls.AMSTERDAM,
    isExternalLink: true,
    isActive: true,
  },
};

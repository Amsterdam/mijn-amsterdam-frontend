import { AppRoutes } from '../../../universal/config';
import { ExternalUrls } from '../../config/app';
import { FeatureToggle } from '../../../universal/config/app';
import { ChapterTitles } from '../../../universal/config/chapter';

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
    title: ChapterTitles.BUURT,
    url: AppRoutes.BUURT,
    isPhoneScreenLink: true,
    id: 'MyAreaHeader',
    isActive: true,
  },
  TIPS: {
    title: ChapterTitles.TIPS,
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
    title: 'Kredietbank',
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
    title: 'MijnOverheid Berichtenbox',
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

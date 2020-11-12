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

const GenericLinks: Record<string, DirectLink> = {
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
  FAQ: {
    title: 'Veelgestelde vragen',
    url: ExternalUrls.MIJN_AMSTERDAM_VEELGEVRAAGD,
    isExternalLink: true,
    isActive: true,
  },
  AMSTERDAM: {
    title: 'Amsterdam.nl',
    url: ExternalUrls.AMSTERDAM,
    isExternalLink: true,
    isActive: true,
  },
  MIJN_OMGEVING: {
    title: 'Mijn omgeving',
    url: AppRoutes.BUURT,
    isPhoneScreenLink: true,
    id: 'MyAreaHeader',
    isActive: true,
  },
  MIJN_OVERHEID_ONDERNEMERS: {
    title: 'MijnOverheid voor ondernemers',
    url:
      'https://www.digitaleoverheid.nl/dossiers/movo-mijn-overheid-voor-ondernemers/',
    isExternalLink: true,
    isActive: true,
  },
  MIJN_OVERHEID_BERICHTEBOX: {
    title: 'MijnOverheid Berichtenbox',
    url: ExternalUrls.BERICHTENBOX,
    isExternalLink: true,
    isActive: true,
  },
};

export const LINKS: Record<ProfileType, Record<string, DirectLink>> = {
  private: {
    BUURT: {
      title: 'Mijn buurt',
      url: AppRoutes.BUURT,
      isPhoneScreenLink: true,
      id: 'MyAreaHeader',
      isActive: true,
    },
    TIPS: GenericLinks.TIPS,
    MIJN_SUBSIDIE: GenericLinks.MIJN_SUBSIDIE,
    KREFIA: {
      title: 'Kredietbank',
      url: ExternalUrls.KREFIA,
      isExternalLink: true,
      isActive: FeatureToggle.KrefiaDirectLinkActive,
    },
    FAQ: GenericLinks.FAQ,
    MIJN_OVERHEID_BERICHTEBOX: GenericLinks.MIJN_OVERHEID_BERICHTEBOX,
    AMSTERDAM: GenericLinks.AMSTERDAM,
  },
  'private-commercial': {
    BUURT: GenericLinks.MIJN_OMGEVING,
    TIPS: GenericLinks.TIPS,
    MIJN_SUBSIDIE: GenericLinks.MIJN_SUBSIDIE,
    FAQ: GenericLinks.FAQ,
    MIJN_OVERHEID_BERICHTEBOX: GenericLinks.MIJN_OVERHEID_BERICHTEBOX,
    MIJN_OVERHEID_ONDERNEMERS: GenericLinks.MIJN_OVERHEID_ONDERNEMERS,
    AMSTERDAM: GenericLinks.AMSTERDAM,
  },
  commercial: {
    BUURT: GenericLinks.MIJN_OMGEVING,
    TIPS: GenericLinks.TIPS,
    MIJN_SUBSIDIE: GenericLinks.MIJN_SUBSIDIE,
    FAQ: GenericLinks.FAQ,
    MIJN_OVERHEID_BERICHTEBOX: GenericLinks.MIJN_OVERHEID_BERICHTEBOX,
    MIJN_OVERHEID_ONDERNEMERS: GenericLinks.MIJN_OVERHEID_ONDERNEMERS,
    AMSTERDAM: GenericLinks.AMSTERDAM,
  },
};

import { AppRoutes } from '../../../universal/config/routes';
import { ExternalUrls } from '../../config/app';

export interface DirectLink {
  title: string;
  url?: string;
  isExternalLink?: true;
  id?: string;
  isActive: boolean;
}

const GenericLinks: Record<string, DirectLink> = {
  UITLEG: {
    title: 'Dit ziet u in Mijn Amsterdam',
    url: AppRoutes.GENERAL_INFO,
    id: 'Uitleg',
    isActive: true,
  },
  STADSBANK_VAN_LENING: {
    title: 'Stadsbank van Lening',
    url: ExternalUrls.STADSBANK_VAN_LENING,
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
  MIJN_OVERHEID_BERICHTENBOX_BURGERS: {
    title: 'MijnOverheid Berichtenbox',
    url: ExternalUrls.BERICHTENBOX_BURGERS,
    isExternalLink: true,
    isActive: true,
  },
  MIJN_OVERHEID_BERICHTENBOX_ONDERNEMERS: {
    title: 'MijnOverheid Berichtenbox',
    url: ExternalUrls.BERICHTENBOX_ONDERNEMERS,
    isExternalLink: true,
    isActive: true,
  },
  TAXI_PORTAAL: {
    title: 'Taxiportaal',
    url: ExternalUrls.AMSTERDAM_TAXI,
    isExternalLink: true,
    isActive: true,
  },
  VAARVIGNETTEN: {
    title: 'Varen in Amsterdam',
    url: ExternalUrls.AMSTERDAM_VAREN,
    isExternalLink: true,
    isActive: true,
  },
};

export const LINKS: Record<ProfileType, Record<string, DirectLink>> = {
  private: {
    UITLEG: GenericLinks.UITLEG,
    STADSBANK_VAN_LENING: GenericLinks.STADSBANK_VAN_LENING,
    FAQ: GenericLinks.FAQ,
    MIJN_OVERHEID_BERICHTENBOX: GenericLinks.MIJN_OVERHEID_BERICHTENBOX_BURGERS,
    AMSTERDAM: GenericLinks.AMSTERDAM,
    TAXI_PORTAAL: GenericLinks.TAXI_PORTAAL,
    VAREN: GenericLinks.VAARVIGNETTEN,
  },
  commercial: {
    UITLEG: GenericLinks.UITLEG,
    STADSBANK_VAN_LENING: GenericLinks.STADSBANK_VAN_LENING,
    FAQ: GenericLinks.FAQ,
    MIJN_OVERHEID_BERICHTENBOX:
      GenericLinks.MIJN_OVERHEID_BERICHTENBOX_ONDERNEMERS,
    AMSTERDAM: GenericLinks.AMSTERDAM,
    TAXI_PORTAAL: GenericLinks.TAXI_PORTAAL,
    VAREN: GenericLinks.VAARVIGNETTEN,
  },
  'private-attributes': {},
};

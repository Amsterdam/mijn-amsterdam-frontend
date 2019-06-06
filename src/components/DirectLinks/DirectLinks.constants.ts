import { AppRoutes } from '../../App.constants';
export type DirectLinkType =
  | 'MIJN_BELASTINGEN'
  | 'MIJN_SUBSIDIE'
  | 'MIJN_WERK_EN_INKOMEN'
  | 'MY_AREA'
  | 'MY_TIPS'
  | 'MIJN_ERFPACHT';

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
  MIJN_BELASTINGEN: {
    title: 'Mijn belastingen',
    url: 'https://belastingbalie.amsterdam.nl',
    isExternalLink: true,
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn subsidie',
    url: 'https://mijnsubsidies.amsterdam.nl/loket/',
    isExternalLink: true,
  },
  MIJN_WERK_EN_INKOMEN: {
    title: 'Mijn werk & inkomen',
    url: 'https://edison.amsterdam.nl/SignIn?ReturnUrl=%2F',
    isExternalLink: true,
  },
  MIJN_ERFPACHT: {
    title: 'Mijn erfpacht',
    url: 'https://mijnerfpacht.amsterdam.nl',
    isExternalLink: true,
  },
};

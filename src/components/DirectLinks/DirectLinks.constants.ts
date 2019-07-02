import { AppRoutes } from 'App.constants';
export type DirectLinkType =
  | 'MIJN_SUBSIDIE'
  | 'MIJN_WERK_EN_INKOMEN'
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
  MIJN_WERK_EN_INKOMEN: {
    title: 'Mijn werk & inkomen',
    url: 'https://edison.amsterdam.nl/SignIn?ReturnUrl=%2F',
    isExternalLink: true,
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn subsidies',
    url: 'https://mijnsubsidies.amsterdam.nl/loket/',
    isExternalLink: true,
  },
};

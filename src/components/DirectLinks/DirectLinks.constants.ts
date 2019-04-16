export type DirectLinkType =
  | 'MIJN_BELASTINGEN'
  | 'MIJN_SUBSIDIE'
  | 'MIJN_WERK_EN_INKOMEN'
  | 'MIJN_ERFPACHT';

export interface DirectLink {
  title: string;
  url: string;
}

export const LINKS: { [key in DirectLinkType]: DirectLink } = {
  MIJN_BELASTINGEN: {
    title: 'Mijn belastingen',
    url: 'https://belastingbalie.amsterdam.nl',
  },
  MIJN_SUBSIDIE: {
    title: 'Mijn subsidie',
    url: 'https://mijnsubsidies.amsterdam.nl/loket/',
  },
  MIJN_WERK_EN_INKOMEN: {
    title: 'Mijn werk & inkomen',
    url: 'https://edison.amsterdam.nl/SignIn?ReturnUrl=%2F',
  },
  MIJN_ERFPACHT: {
    title: 'Mijn erfpacht',
    url: 'https://mijnerfpacht.amsterdam.nl',
  },
};

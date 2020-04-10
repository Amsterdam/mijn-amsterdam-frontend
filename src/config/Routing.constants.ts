import { API_BASE_URL } from './Api.constants';

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  BURGERZAKEN_DOCUMENT: '/burgerzaken/document/:id',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',
  INKOMEN: '/werk-en-inkomen',
  'INKOMEN/STADSPAS': '/werk-en-inkomen/stadspas/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/werk-en-inkomen/bijstandsuitkering/:id',
  'INKOMEN/BIJZONDERE_BIJSTAND': '/werk-en-inkomen/bijzondere-bijstand/:id',
  'INKOMEN/SPECIFICATIES': '/werk-en-inkomen/uitkeringsspecificaties/:type?',
  MIJN_GEGEVENS: '/persoonlijke-gegevens',
  MIJN_BUURT: '/buurt',
  ABOUT: '/over-mijn-amsterdam',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: `${API_BASE_URL}/login`,
  MIJN_TIPS: '/overzicht-tips',
  MELDINGEN: '/overzicht-updates',
  AFVAL: '/afval',
};

export const PublicRoutes = [AppRoutes.PROCLAIMER, AppRoutes.API_LOGIN];
export const PrivateRoutes = Object.values(AppRoutes).filter(
  path => !PublicRoutes.includes(path)
);

export const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};

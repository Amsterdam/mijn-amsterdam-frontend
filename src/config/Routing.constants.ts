import { API_BASE_URL } from './Api.constants';

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  BURGERZAKEN_DOCUMENT: '/burgerzaken/document/:id',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',
  INKOMEN: '/inkomen-en-stadspas',
  'INKOMEN/TOZO_COVID19': '/inkomen-en-stadspas/voorschot-bbz-corona-regeling',
  'INKOMEN/STADSPAS': '/inkomen-en-stadspas/stadspas/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/inkomen-en-stadspas/bijstandsuitkering/:id',
  'INKOMEN/BIJZONDERE_BIJSTAND': '/inkomen-en-stadspas/bijzondere-bijstand/:id',
  'INKOMEN/SPECIFICATIES':
    '/inkomen-en-stadspas/uitkeringsspecificaties/:type?',
  MIJN_GEGEVENS: '/persoonlijke-gegevens',
  MIJN_BUURT: '/buurt',
  ABOUT: '/over-mijn-amsterdam',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: `${API_BASE_URL}/login`,
  MIJN_TIPS: '/overzicht-tips',
  UPDATES: '/overzicht-updates',
  AFVAL: '/afval',
};

export const PublicRoutes = [AppRoutes.PROCLAIMER, AppRoutes.API_LOGIN];
export const PrivateRoutes = Object.values(AppRoutes).filter(
  path => !PublicRoutes.includes(path)
);

export const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};

import { TMA_LOGIN_URL_DIGID, TMA_LOGIN_URL_EHERKENNING } from './api';

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  BURGERZAKEN_DOCUMENT: '/burgerzaken/document/:id',
  ERFPACHT: '/wonen',
  BELASTINGEN: '/belastingen',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',
  INKOMEN: '/inkomen-en-stadspas',
  'INKOMEN/STADSPAS': '/inkomen-en-stadspas/stadspas/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/inkomen-en-stadspas/bijstandsuitkering/:id',
  'INKOMEN/BIJZONDERE_BIJSTAND': '/inkomen-en-stadspas/bijzondere-bijstand/:id',
  'INKOMEN/SPECIFICATIES':
    '/inkomen-en-stadspas/uitkeringsspecificaties/:type?',
  'INKOMEN/TOZO': '/inkomen-en-stadspas/tozo/:type?/:id?',
  BRP: '/persoonlijke-gegevens',
  BUURT: '/buurt',
  ABOUT: '/over-mijn-amsterdam',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: TMA_LOGIN_URL_DIGID,
  API1_LOGIN: TMA_LOGIN_URL_EHERKENNING,
  TIPS: '/overzicht-tips',
  NOTIFICATIONS: '/overzicht-updates',
  AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
};

export const PublicRoutes = [
  AppRoutes.PROCLAIMER,
  AppRoutes.API_LOGIN,
  AppRoutes.ACCESSIBILITY,
];
export const PrivateRoutes = Object.values(AppRoutes).filter(
  path => !PublicRoutes.includes(path)
);

export const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};

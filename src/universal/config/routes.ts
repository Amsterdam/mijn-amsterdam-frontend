import { generatePath } from 'react-router-dom';

export const AppRoutes: Record<string, string> = {
  ROOT: '/',
  HOME: '/',
  BURGERZAKEN: '/burgerzaken',
  BURGERZAKEN_DOCUMENT: '/burgerzaken/document/:id',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',

  'STADSPAS/AANVRAAG': '/stadspas/aanvraag/:id',
  'STADSPAS/SALDO': '/stadspas/saldo/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/inkomen/bijstandsuitkering/:id',
  'INKOMEN/SPECIFICATIES': '/inkomen/specificaties/:type/:page?',
  'INKOMEN/TOZO': '/inkomen/tozo/:version/:id',
  'INKOMEN/TONK': '/inkomen/tonk/:version/:id',
  INKOMEN: '/inkomen',
  STADSPAS: '/stadspas',

  SIA: '/meldingen',
  'SIA/DETAIL': '/meldingen/detail/:id',
  BRP: '/persoonlijke-gegevens',
  KVK: '/gegevens-handelsregister',
  BUURT: '/buurt',
  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  API2_LOGIN: '/api2/login',
  TIPS: '/overzicht-tips',
  NOTIFICATIONS: '/overzicht-updates/:page?',
  AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',
  VERGUNNINGEN: '/vergunningen',
  'VERGUNNINGEN/DETAIL': '/vergunningen/detail/:id',
};

export const AppRoutesRedirect = [
  {
    from: '/inkomen-en-stadspas/stadspas/aanvraag/:id',
    to: AppRoutes['STADSPAS/AANVRAAG'],
  },
  {
    from: '/inkomen-en-stadspas/stadspas/saldo/:id',
    to: AppRoutes['STADSPAS/SALDO'],
  },
  {
    from: '/inkomen-en-stadspas/bijstandsuitkering/:id',
    to: AppRoutes['INKOMEN/BIJSTANDSUITKERING'],
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      type: 'jaaropgave',
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      type: 'jaaropgave',
    }),
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      type: 'uitkering',
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      type: 'uitkering',
    }),
  },
  {
    from: '/inkomen-en-stadspas/tozo/:version/:id',
    to: AppRoutes['INKOMEN/TOZO'],
  },
  { from: '/inkomen-en-stadspas', to: AppRoutes.INKOMEN },
];

export const PublicRoutes = [
  AppRoutes.API_LOGIN,
  AppRoutes.API1_LOGIN,
  AppRoutes.API2_LOGIN,
  AppRoutes.ACCESSIBILITY,
];

export const PrivateRoutes = Object.values(AppRoutes).filter(
  (path) => !PublicRoutes.includes(path)
);

export const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};

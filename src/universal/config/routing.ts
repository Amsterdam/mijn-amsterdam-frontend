export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  BURGERZAKEN_DOCUMENT: '/burgerzaken/document/:id',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',
  INKOMEN: '/inkomen-en-stadspas',
  'INKOMEN/STADSPAS': '/inkomen-en-stadspas/stadspas/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/inkomen-en-stadspas/bijstandsuitkering/:id',
  'INKOMEN/SPECIFICATIES':
    '/inkomen-en-stadspas/uitkeringsspecificaties/:type?',
  'INKOMEN/TOZO': '/inkomen-en-stadspas/tozo/:id?',
  BRP: '/persoonlijke-gegevens',
  BUURT: '/buurt',
  PROCLAIMER: '/proclaimer',
  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  TIPS: '/overzicht-tips',
  NOTIFICATIONS: '/overzicht-updates',
  AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',
};

export const PublicRoutes = [
  AppRoutes.PROCLAIMER,
  AppRoutes.API_LOGIN,
  AppRoutes.ACCESSIBILITY,
  AppRoutes.GENERAL_INFO,
];

export const PrivateRoutes = Object.values(AppRoutes).filter(
  path => !PublicRoutes.includes(path)
);

export const CustomTrackingUrls = {
  [AppRoutes.ROOT]: 'https://mijn.amsterdam.nl/home',
};

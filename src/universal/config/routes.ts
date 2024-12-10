export const AppRoutes = {
  ROOT: '/',
  HOME: '/',
  BURGERZAKEN: '/burgerzaken',
  'BURGERZAKEN/LIST': '/burgerzaken/lijst/:kind/:page?',
  'BURGERZAKEN/ID-KAART': '/burgerzaken/id-kaart/:id',

  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENING': '/zorg-en-ondersteuning/voorziening/:id',
  'ZORG/VOORZIENINGEN_LIST': '/zorg-en-ondersteuning/:kind/:page?',

  HLI: '/regelingen-bij-laag-inkomen',
  'HLI/STADSPAS': '/regelingen-bij-laag-inkomen/stadspas/:id',
  'HLI/REGELING': '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
  'HLI/REGELINGEN_LIST': '/regelingen-bij-laag-inkomen/:kind/:page?',

  'INKOMEN/BIJSTANDSUITKERING': '/inkomen/bijstandsuitkering/:id',
  'INKOMEN/SPECIFICATIES': '/inkomen/specificaties/:variant/:page?',
  'INKOMEN/TOZO': '/inkomen/tozo/:version/:id',
  'INKOMEN/TONK': '/inkomen/tonk/:version/:id',
  'INKOMEN/BBZ': '/inkomen/bbz/:version/:id',
  INKOMEN: '/inkomen',
  AFIS: '/facturen-en-betalen',
  'AFIS/BETAALVOORKEUREN': '/facturen-en-betalen/betaalvoorkeuren',
  'AFIS/FACTUREN': '/facturen-en-betalen/facturen/:state/:page?',
  BRP: '/persoonlijke-gegevens',
  KVK: '/gegevens-handelsregister',
  BUURT: '/buurt',
  BEZWAREN: '/bezwaren',
  'BEZWAREN/DETAIL': '/bezwaren/:uuid',
  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  API2_LOGIN: '/api2/login',
  NOTIFICATIONS: '/overzicht-updates/:page?',
  AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',
  VERGUNNINGEN: '/vergunningen',
  'VERGUNNINGEN/LIST': '/vergunningen/lijst/:kind/:page?',
  'VERGUNNINGEN/DETAIL': '/vergunningen/:title/:id',
  TOERISTISCHE_VERHUUR: '/toeristische-verhuur',
  'TOERISTISCHE_VERHUUR/VERGUNNING/LIST':
    '/toeristische-verhuur/vergunning/list/:kind/:page?',
  'TOERISTISCHE_VERHUUR/VERGUNNING':
    '/toeristische-verhuur/vergunning/:casetype/:id',
  VAREN: '/passagiers-en-beroepsvaart',
  'VAREN/LIST': '/passagiers-en-beroepsvaart/vergunningen/:kind/:page?',
  'VAREN/DETAIL':
    '/passagiers-en-beroepsvaart/vergunning/:caseType/:id',
  SEARCH: '/zoeken',
  KREFIA: '/kredietbank-fibu',
  'PARKEREN/DETAIL': '/parkeren/:title/:id',
  PARKEREN: '/parkeren',
  'PARKEREN/LIST': '/parkeren/lijst/:kind/:page?',
  KLACHTEN: '/klachten/:page?',
  'KLACHTEN/KLACHT': '/klachten/klacht/:id',
  HORECA: '/horeca/',
  'HORECA/DETAIL': '/horeca/:title/:id',
  AVG: '/avg',
  'AVG/LIST': '/avg/lijst/:kind/:page?',
  'AVG/DETAIL': '/avg/verzoek/:id',
  BFF_500_ERROR: '/server-error-500',
  BODEM: '/bodem',
  'BODEM/LIST': '/bodem/lijst/:kind/:page?',
  'BODEM/LOOD_METING': '/bodem/lood-meting/:id',

  // Erfpacht v2
  ERFPACHTv2: '/erfpacht',
  'ERFPACHTv2/DOSSIERS': '/erfpacht/dossiers/:page?',
  'ERFPACHTv2/DOSSIERDETAIL': '/erfpacht/dossier/:dossierNummerUrlParam',
  'ERFPACHTv2/OPEN_FACTUREN': '/erfpacht/open-facturen/:page?',
  'ERFPACHTv2/ALLE_FACTUREN':
    '/erfpacht/facturen/:dossierNummerUrlParam/:page?',

  ZAAK_STATUS: '/zaak-status',
} as const;

export type RouteKey = keyof typeof AppRoutes;
export type AppRoute = (typeof AppRoutes)[RouteKey];

/**
 * @deprecated This file is deprecated. Use the new routes file instead.
 */
export const AppRoutes = {
  ROOT: '/',
  HOME: '/',
  BURGERZAKEN: '/paspoort-en-id-kaart',
  'BURGERZAKEN/LIST': '/paspoort-en-id-kaart/lijst/:kind/:page?',
  'BURGERZAKEN/IDENTITEITSBEWIJS': '/paspoort-en-id-kaart/:documentType/:id',

  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENING': '/zorg-en-ondersteuning/voorziening/:id',
  'ZORG/VOORZIENINGEN_LIST': '/zorg-en-ondersteuning/lijst/:kind/:page?',

  HLI: '/regelingen-bij-laag-inkomen',
  'HLI/STADSPAS': '/regelingen-bij-laag-inkomen/stadspas/:passNumber',
  'HLI/REGELING': '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
  'HLI/REGELINGEN_LIST': '/regelingen-bij-laag-inkomen/lijst/:kind/:page?',

  AFIS: '/facturen-en-betalen',
  'AFIS/BETAALVOORKEUREN': '/facturen-en-betalen/betaalvoorkeuren',
  'AFIS/FACTUREN': '/facturen-en-betalen/facturen/lijst/:state/:page?',

  BEZWAREN: '/bezwaren',
  'BEZWAREN/DETAIL': '/bezwaren/:uuid',
  'BEZWAREN/LIST': '/bezwaren/lijst/:kind/:page?',
  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  API2_LOGIN: '/api2/login',
  NOTIFICATIONS: '/overzicht-updates/:page?',
  AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',
  VERGUNNINGEN: '/vergunningen',
  'VERGUNNINGEN/LIST': '/vergunningen/lijst/:kind/:page?',
  'VERGUNNINGEN/DETAIL': '/vergunningen/:caseType/:id',
  TOERISTISCHE_VERHUUR: '/toeristische-verhuur',
  'TOERISTISCHE_VERHUUR/VERGUNNING/LIST':
    '/toeristische-verhuur/vergunning/lijst/:kind/:page?',
  'TOERISTISCHE_VERHUUR/VERGUNNING':
    '/toeristische-verhuur/vergunning/:caseType/:id',
  'VAREN/LIST': '/passagiers-en-beroepsvaart/vergunningen/lijst/:kind/:page?',
  'VAREN/DETAIL': '/passagiers-en-beroepsvaart/vergunning/:caseType/:id',
  VAREN: '/passagiers-en-beroepsvaart',
  SEARCH: '/zoeken',
  KREFIA: '/kredietbank-fibu',
  'PARKEREN/DETAIL': '/parkeren/:caseType/:id',
  'PARKEREN/LIST': '/parkeren/lijst/:kind/:page?',
  PARKEREN: '/parkeren',
  'KLACHTEN/LIST': '/klachten/lijst/:page?',
  'KLACHTEN/KLACHT': '/klachten/klacht/:id',
  KLACHTEN: '/klachten',
  HORECA: '/horeca/',
  'HORECA/LIST': '/horeca/lijst/:kind/:page?',
  'HORECA/DETAIL': '/horeca/:caseType/:id',
  AVG: '/avg',
  'AVG/LIST': '/avg/lijst/:kind/:page?',
  'AVG/DETAIL': '/avg/verzoek/:id',
  BFF_500_ERROR: '/server-error-500',
  BODEM: '/bodem',
  'BODEM/LIST': '/bodem/lijst/:kind/:page?',
  'BODEM/LOOD_METING': '/bodem/lood-meting/:id',

  // Erfpacht v2
  ERFPACHT: '/erfpacht',
  'ERFPACHT/DOSSIERS': '/erfpacht/dossiers/:page?',
  'ERFPACHT/DOSSIERDETAIL': '/erfpacht/dossier/:dossierNummerUrlParam',
  'ERFPACHT/OPEN_FACTUREN': '/erfpacht/lijst/open-facturen/:page?',
  'ERFPACHT/ALLE_FACTUREN':
    '/erfpacht/facturen/lijst/:dossierNummerUrlParam/:page?',

  'KLANT_CONTACT/CONTACTMOMENTEN': '/contactmomenten/:page?',

  ZAAK_STATUS: '/zaak-status',
} as const;

export const AppRoutesVergunningenThemas = [
  AppRoutes['VERGUNNINGEN/DETAIL'],
  AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
  AppRoutes['VAREN/DETAIL'],
  AppRoutes['PARKEREN/DETAIL'],
  AppRoutes['HORECA/DETAIL'],
] as const;

export type AppRouteVergunningen = (typeof AppRoutesVergunningenThemas)[number];

export type RouteKey = keyof typeof AppRoutes;
export type AppRoute = (typeof AppRoutes)[RouteKey];

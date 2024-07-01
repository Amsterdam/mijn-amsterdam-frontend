import { generatePath } from 'react-router-dom';
import { Match } from '../types';
import { themaNieuw } from './thema-data';

const entries = Object.entries({});
Object.values(themaNieuw).forEach((value) => {
  value.appRoutes.forEach((urlItems) => {
    if (urlItems.urlID) {
      entries.push([urlItems.urlID, urlItems.url]);
    }
  });
});

console.log('13');
export const ThemeRoutes = Object.fromEntries(entries);

export const AppRoutes: Record<string, string> = {
  ROOT: '/',
  HOME: '/',
  // BURGERZAKEN: '/burgerzaken',
  // 'BURGERZAKEN/ID-KAART': '/burgerzaken/id-kaart/:id',
  // 'BURGERZAKEN/PASPOORT': '/burgerzaken/paspoort/:id',
  // ZORG: '/zorg-en-ondersteuning',
  // 'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',

  // 'STADSPAS/AANVRAAG': '/stadspas/aanvraag/:id',
  // 'STADSPAS/SALDO': '/stadspas/saldo-en-transacties/:id',
  // 'INKOMEN/BIJSTANDSUITKERING': '/inkomen/bijstandsuitkering/:id',
  // 'INKOMEN/SPECIFICATIES': '/inkomen/specificaties/:variant/:page?',
  // 'INKOMEN/TOZO': '/inkomen/tozo/:version/:id',
  // 'INKOMEN/TONK': '/inkomen/tonk/:version/:id',
  // 'INKOMEN/BBZ': '/inkomen/bbz/:version/:id',
  // INKOMEN: '/inkomen',
  // STADSPAS: '/stadspas',
  HLI: '/regelingen-bij-laag-inkomen',
  'HLI/STADSPAS': '/regelingen-bij-laag-inkomen/stadspas/:id',
  'HLI/REGELING': '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
  'HLI/REGELINGEN_LIJST':
    '/regelingen-bij-laag-inkomen/eerdere-en-afgewezen-regelingen/:page?',

  SIA: '/meldingen',
  SIA_OPEN: '/alle-open-meldingen/:page?',
  SIA_CLOSED: '/alle-afgesloten-meldingen/:page?',
  'SIA/DETAIL/OPEN': '/detail-open-melding/:id',
  'SIA/DETAIL/CLOSED': '/detail-afgesloten-melding/:id',

  // BRP: '/persoonlijke-gegevens',
  // KVK: '/gegevens-handelsregister',
  // BUURT: '/buurt',
  // BEZWAREN: '/bezwaren',
  // 'BEZWAREN/DETAIL': '/bezwaren/:uuid',
  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  API2_LOGIN: '/api2/login',
  NOTIFICATIONS: '/overzicht-updates/:page?',
  // AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',
  // VERGUNNINGEN: '/vergunningen',
  // 'VERGUNNINGEN/DETAIL': '/vergunningen/:title/:id',
  // TOERISTISCHE_VERHUUR: '/toeristische-verhuur',
  // 'TOERISTISCHE_VERHUUR/VERGUNNING': '/toeristische-verhuur/vergunning/:id',
  // 'TOERISTISCHE_VERHUUR/VERGUNNING/BB':
  //   '/toeristische-verhuur/vergunning/bed-and-breakfast/:id',
  // 'TOERISTISCHE_VERHUUR/VERGUNNING/VV':
  //   '/toeristische-verhuur/vergunning/vakantieverhuur/:id',
  SEARCH: '/zoeken',
  // KREFIA: '/kredietbank-fibu',
  // PARKEREN: '/parkeren',
  // KLACHTEN: '/klachten/:page?',
  // 'KLACHTEN/KLACHT': '/klachten/klacht/:id',
  // HORECA: '/horeca/',
  // 'HORECA/DETAIL': '/horeca/:title/:id',
  YIVI_LANDING: '/inloggen-met-yivi',
  // AVG: '/avg',
  // 'AVG/DETAIL': '/avg/verzoek/:id',
  BFF_500_ERROR: '/server-error-500',
  // BODEM: '/bodem',
  // 'BODEM/LOOD_METING': '/lood-meting/:id',

  // Erfpacht v2
  // ERFPACHTv2: '/erfpacht',
  // 'ERFPACHTv2/DOSSIERS': '/erfpacht/dossiers/:page?',
  // 'ERFPACHTv2/DOSSIERDETAIL': '/erfpacht/dossier/:dossierNummerUrlParam',
  // 'ERFPACHTv2/OPEN_FACTUREN': '/erfpacht/open-facturen/:page?',
  // 'ERFPACHTv2/ALLE_FACTUREN':
  //   '/erfpacht/facturen/:dossierNummerUrlParam/:page?',
  ...ThemeRoutes,
} as const;

console.log('routests', AppRoutes);

// For legacy bookmarks, so for new themas you dont need to use this
export const AppRoutesRedirect = [
  {
    from: '/burgerzaken/document/:id',
    to: AppRoutes['BURGERZAKEN/ID-KAART'],
  },
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
      variant: 'jaaropgave',
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      variant: 'jaaropgave',
    }),
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      variant: 'uitkering',
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      variant: 'uitkering',
    }),
  },
  {
    from: '/inkomen-en-stadspas/tozo/:version/:id',
    to: AppRoutes['INKOMEN/TOZO'],
  },
  { from: '/inkomen-en-stadspas', to: AppRoutes.INKOMEN },
];

export const PublicRoutes: string[] = [
  AppRoutes.API_LOGIN,
  AppRoutes.API1_LOGIN,
  AppRoutes.API2_LOGIN,
  AppRoutes.ACCESSIBILITY,
  AppRoutes.BFF_500_ERROR,
  AppRoutes.ACCESSIBILITY,
  AppRoutes.GENERAL_INFO,
  AppRoutes.ROOT,
];

export const PrivateRoutes = Object.values(AppRoutes).filter(
  (path: string) => !PublicRoutes.includes(path)
);

type RouteKey = keyof typeof AppRoutes;
export type AppRoute = (typeof AppRoutes)[RouteKey];

export interface TrackingConfig {
  profileType: ProfileType;
  isAuthenticated: boolean;
}

//IS MADE FOR ANALITICS IN PIWIKPRO...

type CustomTrackingUrlMap = {
  [key in AppRoute]+?: (match: Match, trackingConfig: TrackingConfig) => string;
};

export const CustomTrackingUrls: CustomTrackingUrlMap = {
  [AppRoutes['VERGUNNINGEN/DETAIL']]: (match: Match) => {
    return `/vergunning/${match.params?.title}`;
  },

  [AppRoutes['INKOMEN/BBZ']]: (match: Match) => {
    return `/inkomen/bbz`;
  },
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]: (match: Match) => {
    return `/inkomen/bijstandsuitkering`;
  },
  [AppRoutes['INKOMEN/TOZO']]: (match: Match) => {
    return `/inkomen/tozo/${match.params?.version}`;
  },
  [AppRoutes['INKOMEN/TONK']]: () => `/inkomen/tonk`,

  [AppRoutes['BURGERZAKEN/ID-KAART']]: () => '/burgerzaken/id-kaart',
  [AppRoutes['BURGERZAKEN/PASPOORT']]: () => '/burgerzaken/paspoort',

  [AppRoutes['STADSPAS/AANVRAAG']]: () => '/stadspas/aavraag',
  [AppRoutes['STADSPAS/SALDO']]: () => '/stadspas/saldo',

  [AppRoutes['ZORG/VOORZIENINGEN']]: () => '/zorg-en-ondersteuning/voorziening',

  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB']]: () =>
    '/toeristische-verhuur/vergunning/bed-and-breakfast',
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV']]: () =>
    '/toeristische-verhuur/vergunning/vakantieverhuur',
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']]: () =>
    '/toeristische-verhuur/vergunning',

  [AppRoutes['KLACHTEN/KLACHT']]: () => '/klachten/klacht',

  [AppRoutes['ERFPACHTv2/DOSSIERDETAIL']]: () => '/erfpacht/dossier',

  [AppRoutes.ROOT]: (
    match: Match,
    { profileType, isAuthenticated }: TrackingConfig
  ) => `/${isAuthenticated ? 'dashboard' : 'landing'}`,
};

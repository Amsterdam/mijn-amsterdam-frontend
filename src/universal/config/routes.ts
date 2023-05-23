import { generatePath } from 'react-router-dom';
import { Match } from '../types';
import {
  LOGIN_URL_DIGID,
  LOGIN_URL_EHERKENNING,
} from '../../client/config/api';

export const AppRoutes: Record<string, string> = {
  ROOT: '/',
  HOME: '/',
  BURGERZAKEN: '/burgerzaken',
  'BURGERZAKEN/ID-KAART': '/burgerzaken/id-kaart/:id',
  'BURGERZAKEN/AKTE': '/burgerzaken/akte/:id',
  ZORG: '/zorg-en-ondersteuning',
  'ZORG/VOORZIENINGEN': '/zorg-en-ondersteuning/voorzieningen/:id',

  'STADSPAS/AANVRAAG': '/stadspas/aanvraag/:id',
  'STADSPAS/SALDO': '/stadspas/saldo/:id',
  'INKOMEN/BIJSTANDSUITKERING': '/inkomen/bijstandsuitkering/:id',
  'INKOMEN/SPECIFICATIES': '/inkomen/specificaties/:variant/:page?',
  'INKOMEN/TOZO': '/inkomen/tozo/:version/:id',
  'INKOMEN/TONK': '/inkomen/tonk/:version/:id',
  'INKOMEN/BBZ': '/inkomen/bbz/:version/:id',
  INKOMEN: '/inkomen',
  STADSPAS: '/stadspas',

  SIA: '/meldingen',
  SIA_OPEN: '/alle-open-meldingen/:page?',
  SIA_CLOSED: '/alle-afgesloten-meldingen/:page?',
  'SIA/DETAIL/OPEN': '/detail-open-melding/:id',
  'SIA/DETAIL/CLOSED': '/detail-afgesloten-melding/:id',

  BRP: '/persoonlijke-gegevens',
  KVK: '/gegevens-handelsregister',
  BUURT: '/buurt',
  BEZWAREN: '/bezwaren',
  API_LOGIN: '/api/login',
  API1_LOGIN: '/api1/login',
  API2_LOGIN: '/api2/login',
  TIPS: '/overzicht-tips',
  NOTIFICATIONS: '/overzicht-updates/:page?',
  AFVAL: '/afval',
  ACCESSIBILITY: '/toegankelijkheidsverklaring',
  GENERAL_INFO: '/uitleg',
  VERGUNNINGEN: '/vergunningen',
  'VERGUNNINGEN/DETAIL': '/vergunningen/:title/:id',
  TOERISTISCHE_VERHUUR: '/toeristische-verhuur',
  'TOERISTISCHE_VERHUUR/VERGUNNING': '/toeristische-verhuur/vergunning/:id',
  'TOERISTISCHE_VERHUUR/VERGUNNING/BB':
    '/toeristische-verhuur/vergunning/bed-and-breakfast/:id',
  'TOERISTISCHE_VERHUUR/VERGUNNING/VV':
    '/toeristische-verhuur/vergunning/vakantieverhuur/:id',
  SEARCH: '/zoeken',
  KREFIA: '/kredietbank-fibu',
  PARKEREN: '/parkeren',
  KLACHTEN: '/klachten/:page?',
  'KLACHTEN/KLACHT': '/klachten/klacht/:id',
  HORECA: '/horeca/',
  'HORECA/DETAIL': '/horeca/:title/:id',
  YIVI_LANDING: '/inloggen-met-yivi',
  AVG: '/avg',
  'AVG/DETAIL': '/avg/verzoek/:id',
  BFF_500_ERROR: '/server-error-500',
  BODEM: '/bodem',
  'BODEM/LOOD_METING': '/lood-meting/:id',
};

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

export const ExcludePageViewTrackingUrls = [
  LOGIN_URL_DIGID,
  LOGIN_URL_EHERKENNING,
];

export const PublicRoutes = [
  AppRoutes.API_LOGIN,
  AppRoutes.API1_LOGIN,
  AppRoutes.API2_LOGIN,
  AppRoutes.ACCESSIBILITY,
  AppRoutes.YIVI_LANDING,
  AppRoutes.BFF_500_ERROR,
  AppRoutes.ACCESSIBILITY,
  AppRoutes.GENERAL_INFO,
  AppRoutes.ROOT,
];

export const PrivateRoutes = Object.values(AppRoutes).filter(
  (path) => !PublicRoutes.includes(path)
);

type AppRoute = keyof typeof AppRoutes;

export interface TrackingConfig {
  profileType: ProfileType;
  isAuthenticated: boolean;
}

export const CustomTrackingUrls: {
  [key: AppRoute]: (match: Match, trackingConfig: TrackingConfig) => string;
} = {
  [AppRoutes['VERGUNNINGEN/DETAIL']]: (match) => {
    return `/vergunning/${match.params?.title}`;
  },

  [AppRoutes['INKOMEN/BBZ']]: (match) => {
    return `/inkomen/bbz`;
  },
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]: (match) => {
    return `/inkomen/bijstandsuitkering`;
  },
  [AppRoutes['INKOMEN/TOZO']]: (match) => {
    return `/inkomen/tozo/${match.params?.version}`;
  },
  [AppRoutes['INKOMEN/TONK']]: (match) => {
    return `/inkomen/tonk`;
  },

  [AppRoutes['BURGERZAKEN/ID-KAART']]: () => '/burgerzaken/id-kaart',

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

  [AppRoutes['SIA/DETAIL/OPEN']]: (match) =>
    `/yivi/open-melding/${match.params?.id}`,
  [AppRoutes['SIA/DETAIL/CLOSED']]: (match) =>
    `/yivi/afgesloten-melding/${match.params?.id}`,
  [AppRoutes.SIA_CLOSED]: (match) =>
    `/yivi/alle-afgesloten-meldingen/pagina-${match.params?.page ?? 1}`,
  [AppRoutes.SIA_OPEN]: (match) =>
    `/yivi/alle-open-meldingen/pagina-${match.params?.page ?? 1}`,

  [AppRoutes.ROOT]: (match, { profileType, isAuthenticated }) =>
    profileType === 'private-attributes'
      ? // NOTE: If we are going to have more kinds of authmethods and usecases for the private-attributes profileType this simple implementation is not sufficient.
        `/yivi/meldingen-overzicht`
      : `/${isAuthenticated ? 'dashboard' : 'landing'}`,
};

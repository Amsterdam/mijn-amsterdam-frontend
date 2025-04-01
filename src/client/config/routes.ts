import { PathMatch } from 'react-router';
import { generatePath, matchPath } from 'react-router';

import { AppRoute, AppRoutes } from '../../universal/config/routes';

export const AppRoutesRedirect = [
  {
    from: '/burgerzaken/document/:id',
    to: AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS'],
  },
  {
    from: '/stadspas',
    to: AppRoutes.HLI,
  },
  {
    from: '/stadspas/saldo/:pasnummer',
    to: AppRoutes.HLI,
  },
  {
    from: '/inkomen-en-stadspas/bijstandsuitkering/:id',
    to: AppRoutes['INKOMEN/BIJSTANDSUITKERING'],
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'jaaropgave',
      page: null,
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/jaaropgaven',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'jaaropgave',
      page: null,
    }),
  },
  {
    from: '/inkomen-en-stadspas/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'uitkering',
      page: null,
    }),
  },
  {
    from: '/inkomen/uitkeringsspecificaties/',
    to: generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
      kind: 'uitkering',
      page: null,
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
  AppRoutes.HOME,
];

export const PrivateRoutes = Object.values(AppRoutes).filter(
  (path: string) => !PublicRoutes.includes(path)
);

export interface TrackingConfig {
  profileType: ProfileType;
  isAuthenticated: boolean;
}

type CustomTrackingUrlMap = {
  [key in AppRoute]+?: (
    match: PathMatch,
    trackingConfig: TrackingConfig
  ) => string;
};

export const CustomTrackingUrls: CustomTrackingUrlMap = {
  [AppRoutes['VERGUNNINGEN/DETAIL']]: (match: PathMatch) => {
    return `/vergunning/${match.params?.title}`;
  },
  [AppRoutes['INKOMEN/BBZ']]: (match: PathMatch) => {
    return `/inkomen/bbz`;
  },
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]: (match: PathMatch) => {
    return `/inkomen/bijstandsuitkering`;
  },
  [AppRoutes['INKOMEN/TOZO']]: (match: PathMatch) => {
    return `/inkomen/tozo/${match.params?.version}`;
  },
  [AppRoutes['INKOMEN/TONK']]: () => `/inkomen/tonk`,

  [AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS']]: () =>
    '/burgerzaken/identiteitsbewijs',

  [AppRoutes['ZORG/VOORZIENING']]: () => '/zorg-en-ondersteuning/voorziening',

  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']]: (match) => {
    return `/toeristische-verhuur/vergunning/${match.params.caseType ?? ''}`;
  },

  [AppRoutes['KLACHTEN/KLACHT']]: () => '/klachten/klacht',

  [AppRoutes['ERFPACHT/DOSSIERDETAIL']]: () => '/erfpacht/dossier',

  [AppRoutes.HOME]: (
    match: PathMatch,
    { profileType, isAuthenticated }: TrackingConfig
  ) => `/${isAuthenticated ? 'dashboard' : 'landing'}`,
};

export function isPrivateRoute(pathname: string) {
  return PrivateRoutes.some((path) => {
    const isMatched = !!matchPath(path, pathname);
    console.log(pathname, path, isMatched);
    return isMatched;
  });
}

import { PathMatch } from 'react-router';

import { AppRoute, AppRoutes } from '../../universal/config/routes';

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

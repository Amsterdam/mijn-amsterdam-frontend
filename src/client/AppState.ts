import { createContext } from 'react';
import type {
  ServiceID,
  ServicesTips,
  ServicesType,
} from '../server/services/controller';
import { FeatureToggle } from '../universal/config';
import { apiPristineResult, ApiResponse } from '../universal/helpers/api';

export type AppState = {
  [key in ServiceID]: ApiResponse<
    ReturnTypeAsync<ServicesType[key]>['content']
  >;
} & {
  TIPS: ServicesTips | ApiResponse<any>;
};

export const PRISTINE_APPSTATE: AppState = {
  // Generated
  TIPS: apiPristineResult([]),
  NOTIFICATIONS: apiPristineResult([]),

  // Direct
  WPI_SPECIFICATIES: apiPristineResult(
    {
      jaaropgaven: [],
      uitkeringsspecificaties: [],
    },
    {
      profileTypes: ['private'],
    }
  ),
  KREFIA: apiPristineResult(null, {
    isActive: FeatureToggle.krefiaActive,
    profileTypes: ['private'],
  }),
  WPI_AANVRAGEN: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  WPI_TOZO: apiPristineResult([], {
    profileTypes: ['private', 'private-commercial'],
  }),
  WPI_TONK: apiPristineResult([], {
    profileTypes: ['private', 'private-commercial'],
  }),
  WPI_BBZ: apiPristineResult([], {
    profileTypes: ['private', 'private-commercial'],
  }),
  WPI_STADSPAS: apiPristineResult(null, {
    profileTypes: ['private'],
  }),
  WMO: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  ERFPACHT: apiPristineResult({ isKnown: false }),
  SUBSIDIE: apiPristineResult(
    { isKnown: false, notifications: [] },
    { isActive: FeatureToggle.subsidieActive }
  ),
  BELASTINGEN: apiPristineResult(
    { isKnown: true },
    { profileTypes: ['private', 'private-commercial'] }
  ),
  BEZWAREN: apiPristineResult([], { isActive: FeatureToggle.bezwarenActive }),
  MILIEUZONE: apiPristineResult({ isKnown: false }),
  AKTES: apiPristineResult([], {
    isActive: FeatureToggle.aktesActive,
    profileTypes: ['private'],
  }),
  TOERISTISCHE_VERHUUR: apiPristineResult({
    vergunningen: [],
    registraties: [],
  }),
  VERGUNNINGEN: apiPristineResult([]),

  // KVK / Handelsregister
  KVK: apiPristineResult(null),

  // Related
  BRP: apiPristineResult(null, {
    profileTypes: ['private', 'private-commercial'],
  }),
  PROFILE: apiPristineResult(null, {
    profileTypes: ['private-attributes'],
  }),
  AFVAL: apiPristineResult([]),
  AFVALPUNTEN: apiPristineResult({
    centers: [],
    datePublished: '',
  }),
  MY_LOCATION: apiPristineResult(null),

  // CMS content
  CMS_CONTENT: apiPristineResult({
    generalInfo: null,
    footer: null,
  }),
  CMS_MAINTENANCE_NOTIFICATIONS: apiPristineResult([]),

  KLACHTEN: apiPristineResult(
    { aantal: 0, klachten: [] },
    { profileTypes: ['private', 'private-commercial'] }
  ),

  SIA: apiPristineResult(
    {
      open: {
        total: 0,
        pageSize: 0,
        items: [],
      },
      afgesloten: {
        total: 0,
        pageSize: 0,
        items: [],
      },
    },
    {
      profileTypes: ['private-attributes'],
      isActive: FeatureToggle.siaActive,
    }
  ),
  HORECA: apiPristineResult([]),

  AVG: apiPristineResult(null, {
    isActive: FeatureToggle.avgActive,
    profileTypes: ['private', 'private-commercial'],
  }),

  BODEM: apiPristineResult(null, { isActive: FeatureToggle.bodemActive }),
};

export const ALL_ERROR_STATE_KEY = 'ALL';

export function createAllErrorState(state: AppState, message: string) {
  return Object.assign({}, state, {
    [ALL_ERROR_STATE_KEY]: {
      status: 'ERROR',
      message,
    },
  });
}

export const AppContext = createContext<AppState>(PRISTINE_APPSTATE);

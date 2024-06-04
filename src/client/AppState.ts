import { createContext } from 'react';
import type { ServiceID, ServicesType } from '../server/services/controller';
import { BagThema, FeatureToggle } from '../universal/config';
import { ApiResponse, apiPristineResult } from '../universal/helpers/api';

export type AppState = {
  [key in ServiceID]: ApiResponse<
    ReturnTypeAsync<ServicesType[key]>['content']
  >;
} & {
  // A place to store additional data not loaded initially but needs to be stored persistently in the app.
  [key in BagThema]?: Record<string, any>;
};

export type AppStateKey = Exclude<keyof AppState, BagThema>;

export const PRISTINE_APPSTATE: AppState = {
  // Generated
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
    profileTypes: ['private'],
  }),
  WPI_TONK: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  WPI_BBZ: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  STADSPAS: apiPristineResult(null, {
    profileTypes: ['private'],
  }),
  HLI: apiPristineResult(null, {
    profileTypes: ['private'],
  }),
  SVWI: apiPristineResult(null, {
    isActive: FeatureToggle.svwiLinkActive,
    profileTypes: ['private'],
  }),
  WMO: apiPristineResult([], {
    profileTypes: ['private'],
  }),
  ERFPACHT: apiPristineResult({ isKnown: false }),
  ERFPACHTv2: apiPristineResult(null, {
    isActive: FeatureToggle.erfpachtV2Active,
    profileTypes: ['private', 'commercial'],
  }),
  SUBSIDIE: apiPristineResult(
    { isKnown: false, notifications: [] },
    { isActive: FeatureToggle.subsidieActive }
  ),
  BELASTINGEN: apiPristineResult(
    { isKnown: true },
    { profileTypes: ['private'] }
  ),
  BEZWAREN: apiPristineResult([], {
    isActive: FeatureToggle.bezwarenActive,
    profileTypes: ['private'],
  }),
  MILIEUZONE: apiPristineResult({ isKnown: false }),
  OVERTREDINGEN: apiPristineResult(
    { isKnown: false },
    { isActive: FeatureToggle.overtredingenActive }
  ),
  TOERISTISCHE_VERHUUR: apiPristineResult({
    vakantieverhuurVergunningen: [],
    lvvRegistraties: [],
    bbVergunningen: [],
  }),
  VERGUNNINGEN: apiPristineResult([]),

  // KVK / Handelsregister
  KVK: apiPristineResult(null),

  // Related
  BRP: apiPristineResult(null, {
    profileTypes: ['private'],
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
    { profileTypes: ['private'] }
  ),

  HORECA: apiPristineResult([]),

  AVG: apiPristineResult(null, {
    isActive: FeatureToggle.avgActive,
    profileTypes: ['private'],
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

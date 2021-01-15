import { createContext } from 'react';
import {
  ServiceID,
  ServicesTips,
  ServicesType,
} from '../server/services/controller';
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
  CASES: apiPristineResult([]),

  // Direct
  FOCUS_SPECIFICATIES: apiPristineResult({
    jaaropgaven: [],
    uitkeringsspecificaties: [],
  }),
  FOCUS_AANVRAGEN: apiPristineResult([]),
  FOCUS_TOZO: apiPristineResult([]),
  FOCUS_STADSPAS: apiPristineResult(null),
  WMO: apiPristineResult([]),
  ERFPACHT: apiPristineResult({ isKnown: false }),
  BELASTINGEN: apiPristineResult({ isKnown: true }),
  MILIEUZONE: apiPristineResult({ isKnown: false }),

  // Related
  BRP: apiPristineResult(null),
  AFVAL: apiPristineResult([]),
  AFVALPUNTEN: apiPristineResult({
    centers: [],
    openingHours: '',
    datePublished: '',
  }),
  HOME: apiPristineResult(null),

  // CMS content
  CMS_CONTENT: apiPristineResult({
    generalInfo: null,
    footer: null,
  }),

  VERGUNNINGEN: apiPristineResult([]),

  // KVK / Handelsregister
  KVK: apiPristineResult(null),
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

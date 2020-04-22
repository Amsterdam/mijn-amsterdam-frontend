import { createContext, useCallback, useState } from 'react';

import { useSSE } from './hooks/useSSE';
import { useOptIn } from './hooks/optin.hook';

import {
  apiPristineResult,
  FEApiResponseData,
  ApiResponse,
} from '../universal/helpers/api';
import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
} from '../server/services';
import { loadServicesMap } from '../server/services/services-map';

export const PRISTINE_APPSTATE = {
  // Generated
  TIPS: apiPristineResult({ items: [] }),
  NOTIFICATIONS: apiPristineResult({ items: [], total: 0 }),
  CASES: apiPristineResult([]),

  // Direct
  FOCUS_SPECIFICATIES: apiPristineResult(null),
  FOCUS_AANVRAGEN: apiPristineResult(null),
  WMO: apiPristineResult(null),
  ERFPACHT: apiPristineResult(null),
  BELASTINGEN: apiPristineResult(null),
  MILIEUZONE: apiPristineResult(null),

  // Related
  BRP: apiPristineResult(null),
  AFVAL: apiPristineResult(null),
  HOME: apiPristineResult(null),
  BUURT: apiPristineResult(null),
};

type GeneratedResponse = FEApiResponseData<typeof loadServicesGenerated>;
type DirectResponse = FEApiResponseData<typeof loadServicesDirect>;
type MapsResponse = FEApiResponseData<typeof loadServicesMap>;
type RelatedResponse = FEApiResponseData<typeof loadServicesRelated>;

type ApiState = GeneratedResponse &
  DirectResponse &
  MapsResponse &
  RelatedResponse;

export type AppState = {
  [key in keyof ApiState]: ApiResponse<ApiState[key]['content']>;
};

export type StateKey = keyof AppState;

export const AppContext = createContext<AppState>(PRISTINE_APPSTATE);

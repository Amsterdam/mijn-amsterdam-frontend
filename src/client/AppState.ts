import { createContext } from 'react';

import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
  loadServicesMap,
  loadServicesCMSContent,
} from '../server/services';
import {
  FEApiResponseData,
  ApiResponse,
  apiPristineResult,
} from '../universal/helpers/api';

type GeneratedResponse = FEApiResponseData<typeof loadServicesGenerated>;
type DirectResponse = FEApiResponseData<typeof loadServicesDirect>;
type MapsResponse = FEApiResponseData<typeof loadServicesMap>;
type RelatedResponse = FEApiResponseData<typeof loadServicesRelated>;
type CMSContentResponse = FEApiResponseData<typeof loadServicesCMSContent>;

type ApiState = GeneratedResponse &
  DirectResponse &
  MapsResponse &
  RelatedResponse &
  CMSContentResponse;

type AppStateController = {
  [key in keyof ApiState]?: {
    fetch: (...args: any) => void;
    [key: string]: any;
  };
};

export type AppState = {
  [key in keyof ApiState]: ApiResponse<ApiState[key]['content']>;
} & {
  controller: AppStateController;
};

export const PRISTINE_APPSTATE = {
  // Generated
  TIPS: apiPristineResult({ items: [] }),
  NOTIFICATIONS: apiPristineResult([]),
  CASES: apiPristineResult([]),

  // Direct
  FOCUS_SPECIFICATIES: apiPristineResult({
    jaaropgaven: [],
    uitkeringsspecificaties: [],
  }),
  FOCUS_AANVRAGEN: apiPristineResult([]),
  FOCUS_TOZO: apiPristineResult(null),
  WMO: apiPristineResult({ items: [] }),
  ERFPACHT: apiPristineResult({ isKnown: false }),
  BELASTINGEN: apiPristineResult({ isKnown: true }),
  MILIEUZONE: apiPristineResult({ isKnown: false }),

  // Related
  BRP: apiPristineResult(null),
  AFVAL: apiPristineResult([]),
  AFVALPUNTEN: apiPristineResult({ centers: [], openingHours: '' }),
  HOME: apiPristineResult(null),
  BUURT: apiPristineResult(null),

  // CMS content
  CMS_CONTENT: apiPristineResult({
    generalInfo: null,
  }),

  VERGUNNINGEN: apiPristineResult([]),

  // Use the controller to add functionality for refetching app state
  controller: {},
};

export const AppContext = createContext<AppState>(PRISTINE_APPSTATE);

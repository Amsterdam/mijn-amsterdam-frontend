import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDataApi } from './api/api.hook';
import { BFFApiUrls } from '../config/api';
import { useSSE } from './useSSE';
import { transformAppState } from '../data-transform/appState';
import { useTipsApi } from './api/api.tips';
import { apiPristineResult } from '../../universal/helpers';

import { FEApiResponseData, ApiResponse } from '../../universal/helpers/api';
import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
} from '../../server/services';
import { loadServicesMap } from '../../server/services/services-map';

type GeneratedResponse = FEApiResponseData<typeof loadServicesGenerated>;
type DirectResponse = FEApiResponseData<typeof loadServicesDirect>;
type MapsResponse = FEApiResponseData<typeof loadServicesMap>;
type RelatedResponse = FEApiResponseData<typeof loadServicesRelated>;

type ApiState = GeneratedResponse &
  DirectResponse &
  MapsResponse &
  RelatedResponse;

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
  NOTIFICATIONS: apiPristineResult({ items: [], total: 0 }),
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
  AFVAL: apiPristineResult({ ophalen: [], wegbrengen: [] }),
  HOME: apiPristineResult(null),
  BUURT: apiPristineResult(null),

  // Probeersel
  controller: {},
};

export function useAppState() {
  const { TIPS, fetch: fetchTips } = useTipsApi();

  const controller = useMemo(() => {
    return {
      TIPS: {
        fetch: fetchTips,
      },
    };
  }, [fetchTips]);

  const [appState, setAppState] = useState<AppState>(
    Object.assign({}, PRISTINE_APPSTATE, { controller })
  );

  // IE11 and early edge versions don't have EventSource support. These browsers will use the the Sauron endpoint.
  if (!('EventSource' in window)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [api] = useDataApi<AppState | null>(
      {
        url: BFFApiUrls.SERVICES_SAURON,
        transformResponse: transformAppState,
      },
      null
    );
    if (api.data !== null) {
      setAppState(api.data);
    }
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onEvent = useCallback((messageData: any) => {
      if (messageData) {
        setAppState((state: any) => {
          const transformedMessageData = transformAppState(messageData);
          return Object.assign({}, state, transformedMessageData);
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSSE(BFFApiUrls.SERVICES_SSE, 'message', onEvent);
  }

  // Add TIPS to AppState if they are refetched
  useEffect(() => {
    if (TIPS.status !== 'PRISTINE') {
      const tipsState = transformAppState({ TIPS });
      setAppState(appState => {
        return Object.assign({}, appState, tipsState);
      });
    }
  }, [TIPS]);

  return appState;
}

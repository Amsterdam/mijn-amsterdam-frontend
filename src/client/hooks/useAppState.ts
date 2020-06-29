import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDataApi, requestApiData } from './api/api.hook';
import { BFFApiUrls } from '../config/api';
import { useSSE } from './useSSE';
import { transformAppState } from '../data-transform/appState';
import { useTipsApi } from './api/api.tips';
import { PRISTINE_APPSTATE, AppState } from '../AppState';

export function useAppState() {
  const { TIPS, fetch: fetchTips } = useTipsApi();

  // The controller is used for close coupling of state refetch methods .
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
        transformResponse: [
          ...requestApiData.defaults.transformResponse,
          transformAppState,
        ],
      },
      null
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (api.data !== null) {
        setAppState(
          Object.assign({ controller: appState.controller }, api.data)
        );
      }
    }, [appState.controller, api.data]);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onEvent = useCallback((messageData: any) => {
      if (messageData) {
        const transformedMessageData = transformAppState(messageData);
        setAppState(appState => {
          const appStateUpdated = {
            ...appState,
            ...transformedMessageData,
          };
          return appStateUpdated;
        });
      }
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
    } else {
      setAppState(Object.assign({}, appState, { TIPS }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TIPS]);

  return appState;
}

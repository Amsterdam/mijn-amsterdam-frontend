import * as Sentry from '@sentry/browser';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDataApi, requestApiData } from './api/api.hook';
import { BFFApiUrls } from '../config/api';
import { useSSE, SSE_ERROR_MESSAGE } from './useSSE';
import { transformAppState } from '../data-transform/appState';
import { useTipsApi } from './api/api.tips';
import { PRISTINE_APPSTATE, AppState } from '../AppState';

const sauronRequestOptions = {
  url: BFFApiUrls.SERVICES_SAURON,
  postpone: true,
  transformResponse: [
    ...requestApiData.defaults.transformResponse,
    transformAppState,
  ],
};

const hasEventSourceSupport = !('EventSource' in window); // IE11 and early edge versions don't have EventSource support. These browsers will use the the Sauron endpoint.

/**
 * The primary communication is the EventSource. In the case the EventSource can't connect to the server, a number of retries will take place.
 * If the EventSource fails the Sauron endpoint /all will be used in a last attempt to fetch the data needed to display a fruity application.
 * If that fails we just can't connect to the server for whatever reason. Sentry error handling might have information about this scenario.
 */
export function useAppState() {
  const { TIPS, fetch: fetchTips } = useTipsApi();
  const [isTheOneEndpoint, setSauronFallback] = useState(hasEventSourceSupport);
  const [isDataRequested, setIsDateRequested] = useState(false);

  // The controller is used for close coupling of state refetch methods. You can put fetch methods here that can be called from components.
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

  const [api, fetchSauron] = useDataApi<AppState | null>(
    sauronRequestOptions,
    null
  );

  useEffect(() => {
    if (!isDataRequested && isTheOneEndpoint && api.isPristine) {
      if (hasEventSourceSupport) {
        Sentry.captureMessage('SSE Failed, using Sauron');
      }
      fetchSauron({
        ...sauronRequestOptions,
        postpone: false,
      });
    }
  }, [fetchSauron, isTheOneEndpoint, api.isPristine, isDataRequested]);

  useEffect(() => {
    if (isDataRequested) {
      return;
    }
    if (api.data !== null && !api.isLoading && !api.isError) {
      setAppState(appState => Object.assign({}, appState, api.data));
      setIsDateRequested(true);
    } else if (api.isError) {
      const errorMessage =
        'Services.all endpoint could not be reached or returns an error. ' +
        (isTheOneEndpoint ? 'Sauron fallback enabled.' : '');

      setAppState(appState =>
        Object.assign({}, appState, {
          ALL: {
            status: 'ERROR',
            message: errorMessage,
          },
        })
      );
      setIsDateRequested(true);
    }
  }, [appState, api, isTheOneEndpoint, isDataRequested]);

  // The EventSource will only be used if we're not using theOneEndpoint.
  const onEvent = useCallback((messageData: any) => {
    if (messageData && messageData !== SSE_ERROR_MESSAGE) {
      const transformedMessageData = transformAppState(messageData);
      setAppState(appState => {
        const appStateUpdated = {
          ...appState,
          ...transformedMessageData,
        };
        return appStateUpdated;
      });
    } else if (messageData === SSE_ERROR_MESSAGE) {
      setSauronFallback(true);
    }
  }, []);

  useSSE(BFFApiUrls.SERVICES_SSE, 'message', onEvent, isTheOneEndpoint);

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

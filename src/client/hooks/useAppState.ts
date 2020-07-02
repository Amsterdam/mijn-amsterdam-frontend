import * as Sentry from '@sentry/browser';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDataApi, requestApiData, pollBffHealth } from './api/api.hook';
import { BFFApiUrls } from '../config/api';
import { useSSE, SSE_ERROR_MESSAGE } from './useSSE';
import { transformAppState } from '../data-transform/appState';
import { useTipsApi } from './api/api.tips';
import { PRISTINE_APPSTATE, AppState } from '../AppState';

const fallbackServiceRequestOptions = {
  url: BFFApiUrls.SERVICES_SAURON,
  postpone: true,
  transformResponse: [
    ...requestApiData.defaults.transformResponse,
    transformAppState,
  ],
};

/**
 * The primary communication is the EventSource. In the case the EventSource can't connect to the server, a number of retries will take place.
 * If the EventSource fails the Fallback service endpoint /all will be used in a last attempt to fetch the data needed to display a fruity application.
 * If that fails we just can't connect to the server for whatever reason. Sentry error handling might have information about this scenario.
 */
export function useAppState() {
  const hasEventSourceSupport = 'EventSource' in window; // IE11 and early edge versions don't have EventSource support. These browsers will use the the Fallback service endpoint.
  const { TIPS, fetch: fetchTips } = useTipsApi();
  const [isFallbackServiceEnabled, setFallbackServiceEnabled] = useState(
    !hasEventSourceSupport
  );
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

  const [api, fetchFallbackService] = useDataApi<AppState | null>(
    fallbackServiceRequestOptions,
    null
  );

  function appStateError(message: string) {
    setAppState(appState =>
      Object.assign({}, appState, {
        ALL: {
          status: 'ERROR',
          message,
        },
      })
    );
  }

  // If no EvenSource support or EventSource fails, the Fallback service endpoint is used for fetching all the data.
  useEffect(() => {
    if (!isDataRequested && isFallbackServiceEnabled && api.isPristine) {
      // If we have EventSource support but in the case it failed
      if (hasEventSourceSupport) {
        console.log('SSE Failed, using Fallback service');
        Sentry.captureMessage('SSE Failed, using Fallback service');

        // We don't know why it failed, ashortcoming of EventSource error handling, so we poll for server health which is a likely source of failure.
        pollBffHealth()
          .then(() => {
            fetchFallbackService({
              ...fallbackServiceRequestOptions,
              postpone: false,
            });
          })
          .catch(appStateError);
      } else {
        // If we don't have EventSource support start with the Fallback service immediately
        fetchFallbackService({
          ...fallbackServiceRequestOptions,
          postpone: false,
        });
      }
    }
  }, [
    fetchFallbackService,
    isFallbackServiceEnabled,
    api.isPristine,
    isDataRequested,
    hasEventSourceSupport,
  ]);

  // Update the appState with data fetched by the Fallback service endpoint
  useEffect(() => {
    if (isDataRequested) {
      return;
    }
    if (api.data !== null && !api.isLoading && !api.isError) {
      setAppState(appState => Object.assign({}, appState, api.data));
      setIsDateRequested(true);
    } else if (api.isError) {
      // If everything fails, this is the final state update.
      const errorMessage =
        'Services.all endpoint could not be reached or returns an error. ' +
        (isFallbackServiceEnabled ? 'Fallback service fallback enabled.' : '');

      appStateError(errorMessage);
      setIsDateRequested(true);
    }
  }, [appState, api, isFallbackServiceEnabled, isDataRequested]);

  // The EventSource will only be used if we have EventSource support
  const onEvent = useCallback((messageData: any) => {
    if (messageData && messageData !== SSE_ERROR_MESSAGE) {
      const transformedMessageData = transformAppState(messageData);
      setAppState(appState => {
        const appStateUpdated = {
          ...appState,
          // Should there be an
          ...transformedMessageData,
        };
        return appStateUpdated;
      });
    } else if (messageData === SSE_ERROR_MESSAGE) {
      setFallbackServiceEnabled(true);
    }
  }, []);

  useSSE(BFFApiUrls.SERVICES_SSE, 'message', onEvent, isFallbackServiceEnabled);

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

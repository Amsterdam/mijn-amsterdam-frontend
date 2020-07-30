import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AppState, createAllErrorState, PRISTINE_APPSTATE } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformAppState } from '../data-transform/appState';
import { pollBffHealth, requestApiData, useDataApi } from './api/useDataApi';
import { SSE_ERROR_MESSAGE, useSSE } from './useSSE';

const fallbackServiceRequestOptions = {
  url: BFFApiUrls.SERVICES_SAURON,
  postpone: true,
  transformResponse: [
    ...requestApiData.defaults.transformResponse,
    transformAppState,
  ],
};

export const appStateAtom = atom<AppState>({
  key: 'appState',
  default: PRISTINE_APPSTATE, // default value (aka initial value)
});

/**
 * The primary communication is the EventSource. In the case the EventSource can't connect to the server, a number of retries will take place.
 * If the EventSource fails the Fallback service endpoint /all will be used in a last attempt to fetch the data needed to display a fruity application.
 * If that fails we just can't connect to the server for whatever reason. Sentry error handling might have information about this scenario.
 */
export function useAppState() {
  const hasEventSourceSupport = 'EventSource' in window; // IE11 and early edge versions don't have EventSource support. These browsers will use the the Fallback service endpoint.
  // const { TIPS, isLoading: isLoadingTips } = useTipsApi();
  const [isFallbackServiceEnabled, setFallbackServiceEnabled] = useState(
    !hasEventSourceSupport
  );
  const [isDataRequested, setIsDateRequested] = useState(false);

  const [appState, setAppState] = useRecoilState(appStateAtom);

  const [api, fetchFallbackService] = useDataApi<AppState | null>(
    fallbackServiceRequestOptions,
    null
  );

  function appStateError(message: string) {
    Sentry.captureMessage('Could not load any data sources.', {
      extra: {
        message,
      },
    });
    setAppState(appState => createAllErrorState(appState, message));
  }

  // If no EvenSource support or EventSource fails, the Fallback service endpoint is used for fetching all the data.
  useEffect(() => {
    if (!isDataRequested && isFallbackServiceEnabled && api.isPristine) {
      // If we have EventSource support but in the case it failed
      if (hasEventSourceSupport) {
        console.info('SSE Failed, using Fallback service');

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

  // // Add TIPS to AppState if they are refetched
  // useEffect(() => {
  //   if (
  //     !isLoadingTips &&
  //     TIPS.status !== 'PRISTINE' &&
  //     TIPS.content !== appState.TIPS.content
  //   ) {
  //     const tipsState = transformAppState({ TIPS });
  //     setAppState(Object.assign({}, appState, tipsState));
  //   } else if (isLoadingTips && TIPS.content !== appState.TIPS.content) {
  //     setAppState(Object.assign({}, appState, { TIPS }));
  //   }
  // }, [TIPS, appState, isLoadingTips]);

  return appState;
}

export function useAppStateAtom() {
  return useAppStateGetter();
}
export function useAppStateGetter() {
  return useRecoilState(appStateAtom)[0];
}

export function useAppStateSetter() {
  return useRecoilState(appStateAtom)[1];
}

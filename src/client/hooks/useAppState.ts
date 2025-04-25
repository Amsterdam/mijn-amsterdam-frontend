import { useCallback, useEffect, useRef, useState } from 'react';

import { SetterOrUpdater, atom, useRecoilState, useRecoilValue } from 'recoil';

import { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import {
  ApiResponse_DEPRECATED,
  apiPristineResult,
} from '../../universal/helpers/api';
import { AppState } from '../../universal/types/App.types';
import { PRISTINE_APPSTATE, createAllErrorState } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';
import { captureMessage } from '../helpers/monitoring';
import { useDataApi } from './api/useDataApi';
import { useProfileTypeValue } from './useProfileType';
import { SSE_CLOSE_MESSAGE, SSE_ERROR_MESSAGE, useSSE } from './useSSE';
import { entries } from '../../universal/helpers/utils';

const fallbackServiceRequestOptions = {
  postpone: true,
};

export const appStateAtom = atom<AppState>({
  key: 'appState',
  default: PRISTINE_APPSTATE as AppState,
});

export const appStateReadyAtom = atom<boolean>({
  key: 'appStateReady',
  default: false,
});

interface useAppStateFallbackServiceProps {
  profileType: ProfileType;
  isEnabled: boolean;
  setAppState: SetterOrUpdater<AppState>;
}

export function useAppStateFallbackService({
  profileType,
  isEnabled,
  setAppState,
}: useAppStateFallbackServiceProps) {
  const [api, fetchFallbackService] = useDataApi<AppState | null>(
    fallbackServiceRequestOptions,
    null
  );
  const setIsAppStateReady = useSetAppStateReady();

  const appStateError = useCallback(
    (message: string) => {
      captureMessage('Could not load any data sources.', {
        properties: {
          message,
        },
        severity: 'critical',
      });
      setAppState((appState) => createAllErrorState(appState, message));
    },
    [setAppState]
  );

  // If no EvenSource support or EventSource fails, the Fallback service endpoint is used for fetching all the data.
  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    fetchFallbackService({
      ...fallbackServiceRequestOptions,
      url: BFFApiUrls.SERVICES_SAURON,
      postpone: false,
    });
  }, [fetchFallbackService, isEnabled, profileType]);

  // Update the appState with data fetched by the Fallback service endpoint
  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    if (api.data !== null && !api.isLoading && !api.isError) {
      setAppState((appState) => {
        return Object.assign({}, appState, transformSourceData(api.data));
      });
      setIsAppStateReady(true);
    } else if (api.isError) {
      // If everything fails, this is the final state update.
      const errorMessage =
        'Services.all endpoint could not be reached or returns an error.';
      appStateError(errorMessage);
    }
  }, [api, appStateError, setAppState, isEnabled, setIsAppStateReady]);
}

export function addParamsToStreamEndpoint(
  url: string,
  searchParams: string = location.search
) {
  let streamEndpointUrl = url;

  // For testing and development purposes we can pass a set of arbitrary parameters to the BFF.
  // See also: universal/config/app.ts : streamEndpointQueryParamKeys
  if (FeatureToggle.passQueryParamsToStreamUrl) {
    const testStreamEndpointUrl = streamEndpointUrl;
    if (searchParams !== '') {
      const locationParams = new URLSearchParams(searchParams);
      const newUrlSearchParams = new URLSearchParams();
      for (const [param, value] of locationParams.entries()) {
        if (param in streamEndpointQueryParamKeys) {
          newUrlSearchParams.set(param, value);
        }
      }
      if (newUrlSearchParams.size) {
        streamEndpointUrl = `${testStreamEndpointUrl}?${newUrlSearchParams.toString()}`;
      }
    }
  }

  return streamEndpointUrl;
}

const streamEndpoint = addParamsToStreamEndpoint(BFFApiUrls.SERVICES_SSE);

/**
 * The primary communication is the EventSource. In the case the EventSource can't connect to the server, a number of retries will take place.
 * If the EventSource fails the Fallback service endpoint /all will be used in a last attempt to fetch the data needed to display a fruity application.
 * If that fails we just can't connect to the server for whatever reason. Monitoring error handling might have information about this scenario.
 */
export function useAppStateRemote() {
  const hasEventSourceSupport = 'EventSource' in window; // IE11 and early edge versions don't have EventSource support. These browsers will use the the Fallback service endpoint.
  const [isFallbackServiceEnabled, setFallbackServiceEnabled] = useState(
    !hasEventSourceSupport
  );

  const profileType = useProfileTypeValue();
  const [appState, setAppState] = useRecoilState(appStateAtom);
  const setIsAppStateReady = useSetAppStateReady();

  // First retrieve all the services specified in the BFF, after that Only retrieve incremental updates
  const useIncremental = useRef(false);

  useEffect(() => {
    useIncremental.current = true;
  }, []);

  // The callback is fired on every incoming message from the EventSource.
  const onEvent = useCallback((messageData: string | object) => {
    if (typeof messageData === 'object') {
      const transformedMessageData = transformSourceData(messageData);
      setAppState((appState) => {
        const appStateUpdated = {
          ...appState,
          ...transformedMessageData,
        };
        return appStateUpdated;
      });
    } else if (messageData === SSE_ERROR_MESSAGE) {
      setFallbackServiceEnabled(true);
    } else if (messageData === SSE_CLOSE_MESSAGE) {
      setIsAppStateReady(true);
    } else {
      // eslint-disable-next-line no-console
      console.log('event source', messageData);
    }
  }, []);

  useSSE({
    path: streamEndpoint,
    eventName: 'message',
    callback: onEvent,
    postpone: isFallbackServiceEnabled,
  });

  useAppStateFallbackService({
    profileType,
    isEnabled: hasEventSourceSupport ? isFallbackServiceEnabled : true,
    setAppState,
  });

  return appState;
}

export function useAppStateGetter() {
  return useRecoilValue(appStateAtom);
}

export function useAppStateSetter() {
  return useRecoilState(appStateAtom)[1];
}

function useSetAppStateReady() {
  return useRecoilState(appStateReadyAtom)[1];
}

export function useAppStateReady() {
  return useRecoilValue(appStateReadyAtom);
}

export interface AppStateBagApiParams {
  url?: string;
  bagThema: string;
  key: string;
}

// Use this hook for loading additional data that needs to be persisted in the state. For example additional data loaded if a user navigates to a detailpage
// that requires fetching data that wasn't retrieved initially.
export function useAppStateBagApi<T>({
  url,
  bagThema,
  key,
}: AppStateBagApiParams) {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  const isApiDataCached =
    appState[bagThema] !== null &&
    typeof appState[bagThema] === 'object' &&
    typeof appState[bagThema] !== 'undefined' &&
    key in appState[bagThema]!;

  const [api, fetch] = useDataApi<ApiResponse_DEPRECATED<T | null>>(
    {
      url,
      postpone: isApiDataCached || !url,
    },
    apiPristineResult(null)
  );

  useEffect(() => {
    // Initial automatic fetch
    if (url && !isApiDataCached && !api.isDirty && !api.isLoading) {
      fetch({
        url,
        postpone: false,
      });
    }

    if (!isApiDataCached && api.isDirty && !api.isLoading) {
      setAppState((state) => {
        let localState = state[bagThema];
        if (!localState) {
          localState = {};
        }

        localState = {
          ...localState,
          [key]: api.data as ApiResponse_DEPRECATED<T | null>,
        };

        return {
          ...state,
          [bagThema]: localState,
        };
      });
    }
  }, [isApiDataCached, api, key, url]);

  return [
    (appState?.[bagThema]?.[key] as ApiResponse_DEPRECATED<T | null>) ||
      api.data, // Return the response data from remote system or the pristine data provided to useApiData.
    fetch,
    isApiDataCached,
  ] as const;
}

export function useGetAppStateBagDataByKey<T>({
  bagThema,
  key,
}: Omit<AppStateBagApiParams, 'url'>): ApiResponse_DEPRECATED<T | null> | null {
  const appState = useRecoilValue(appStateAtom);
  return appState?.[bagThema]?.[key] ?? null;
}

export function useRemoveAppStateBagData() {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  return useCallback(
    ({ bagThema, key: keyExpected }: Omit<AppStateBagApiParams, 'url'>) => {
      const local = appState[bagThema];
      if (local) {
        setAppState(
          Object.assign({}, appState, {
            [bagThema]: Object.fromEntries(
              entries(local).filter(([key]) => {
                return keyExpected !== key;
              })
            ),
          })
        );
      }
    },
    [appState]
  );
}

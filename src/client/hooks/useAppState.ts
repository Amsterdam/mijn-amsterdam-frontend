import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SetterOrUpdater, atom, useRecoilState, useRecoilValue } from 'recoil';
import { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import {
  ApiPristineResponse,
  ApiResponse,
  ApiSuccessResponse,
  apiPristineResult,
} from '../../universal/helpers/api';
import {
  AppState,
  AppStateKey,
  BagThema,
} from '../../universal/types/App.types';
import { PRISTINE_APPSTATE, createAllErrorState } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';
import { captureMessage } from '../utils/monitoring';
import { useDataApi } from './api/useDataApi';
import { useProfileTypeValue } from './useProfileType';
import { SSE_ERROR_MESSAGE, useSSE } from './useSSE';

const fallbackServiceRequestOptions = {
  postpone: true,
};

export const appStateAtom = atom<AppState>({
  key: 'appState',
  default: PRISTINE_APPSTATE as AppState,
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
    } else if (api.isError) {
      // If everything fails, this is the final state update.
      const errorMessage =
        'Services.all endpoint could not be reached or returns an error.';
      appStateError(errorMessage);
    }
  }, [api, appStateError, setAppState, isEnabled]);
}

export function addParamsToStreamEndpoint(
  url: string,
  searchParams: string = location.search
) {
  let streamEndpointUrl = url;

  // For testing and development purposes we can pass a set of arbitrary parameters to the BFF.
  // See also: universal/config/app.ts : streamEndpointQueryParamKeys
  if (FeatureToggle.passQueryParamsToStreamUrl) {
    let testStreamEndpointUrl = streamEndpointUrl;
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

  // First retrieve all the services specified in the BFF, after that Only retrieve incremental updates
  const useIncremental = useRef(false);

  useEffect(() => {
    useIncremental.current = true;
  }, []);

  // The callback is fired on every incoming message from the EventSource.
  const onEvent = useCallback((messageData: any) => {
    if (messageData && messageData !== SSE_ERROR_MESSAGE) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export function isAppStateReady(
  appState: AppState,
  pristineAppState: AppState,
  profileType: ProfileType
) {
  const isLegacyProfileType = ['private', 'commercial'].includes(profileType);
  const profileStates = Object.entries(appState).filter(
    ([appStateKey, state]) => {
      const key = appStateKey as AppStateKey;
      const stateConfig = pristineAppState[
        key
      ] as unknown as ApiPristineResponse<any>;

      const isProfileMatch =
        (isLegacyProfileType && !stateConfig?.profileTypes?.length) ||
        stateConfig?.profileTypes?.includes(profileType);

      // NOTE: The appState keys ending with _BAG are not considered a fixed/known portion of the appstate.
      if (!stateConfig && !key.endsWith('_BAG')) {
        captureMessage(`unknown stateConfig key: ${appStateKey}`);
      }

      // If we encounter an unknown stateConfig we treat the state to be ready so we don't block the isReady completely.
      return isProfileMatch && (!!stateConfig?.isActive || !stateConfig);
    }
  );

  return (
    !!profileStates.length &&
    profileStates.every(([appStateKey, state]) => {
      return typeof state !== 'undefined' && state.status !== 'PRISTINE';
    })
  );
}

export function useAppStateReady() {
  const appState = useAppStateGetter();
  const profileType = useProfileTypeValue();

  return useMemo(
    () => isAppStateReady(appState, PRISTINE_APPSTATE, profileType),
    [appState, profileType]
  );
}

export interface AppStateBagApiParams {
  url: string;
  bagThema: BagThema;
  key: string;
  postponeFetch?: boolean;
}

// Use this hook for loading additional data that needs to be persisted in the state. For example additional data loaded if a user navigates to a detailpage
// that requires fetching data that wasn't retrieved initially.
export function useAppStateBagApi<T extends unknown>({
  url,
  bagThema,
  key,
  postponeFetch = false,
}: AppStateBagApiParams) {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  const isApiDataCached =
    typeof appState[bagThema] !== null &&
    typeof appState[bagThema] === 'object' &&
    typeof appState[bagThema] !== 'undefined' &&
    key in appState[bagThema]!;

  const [api, fetch] = useDataApi<ApiResponse<T | null>>(
    {
      url,
      postpone: isApiDataCached || !url,
    },
    apiPristineResult(null)
  );

  useEffect(() => {
    if (url && !isApiDataCached && !api.isDirty && !api.isLoading) {
      fetch({
        url,
        postpone: false,
      });
    }
    if (!isApiDataCached && !!api.data.content) {
      setAppState((state) => {
        let localState = state[bagThema];
        if (!localState) {
          localState = {};
        }

        localState = {
          ...localState,
          [key]: api.data.content as T,
        };

        if ((api.data as ApiSuccessResponse<T>).failedDependencies) {
          localState = {
            ...localState,
            failedDependencies: (api.data as ApiSuccessResponse<T>)
              .failedDependencies,
          };
        }

        return {
          ...state,
          [bagThema]: localState,
        };
      });
    }
  }, [isApiDataCached, api, key, url]);

  return [appState?.[bagThema]?.[key] as T, api, fetch] as const;
}

export function useRemoveAppStateBagData() {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  return useCallback(
    ({ bagThema, key: keyExpected }: Omit<AppStateBagApiParams, 'url'>) => {
      const local = appState[bagThema];
      if (!!local) {
        setAppState(
          Object.assign({}, appState, {
            [bagThema]: Object.fromEntries(
              Object.entries(local).filter(([key]) => {
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

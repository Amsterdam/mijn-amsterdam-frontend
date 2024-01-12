import * as Sentry from '@sentry/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { atom, SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';
import {
  ApiPristineResponse,
  apiPristineResult,
  ApiResponse,
} from '../../universal/helpers';

import { BagChapter } from '../../universal/config';
import { AppState, createAllErrorState, PRISTINE_APPSTATE } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';
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
      Sentry.captureMessage('Could not load any data sources.', {
        extra: {
          message,
        },
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

/**
 * The primary communication is the EventSource. In the case the EventSource can't connect to the server, a number of retries will take place.
 * If the EventSource fails the Fallback service endpoint /all will be used in a last attempt to fetch the data needed to display a fruity application.
 * If that fails we just can't connect to the server for whatever reason. Sentry error handling might have information about this scenario.
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
    path: BFFApiUrls.SERVICES_SSE,
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
      const key = appStateKey as keyof AppState;
      const stateConfig = pristineAppState[
        key
      ] as unknown as ApiPristineResponse<any>;

      const isProfileMatch =
        (isLegacyProfileType && !stateConfig?.profileTypes?.length) ||
        stateConfig?.profileTypes?.includes(profileType);

      // NOTE: The appState keys ending with _BAG are not considered a fixed/known portion of the appstate.
      if (!stateConfig && !key.endsWith('_BAG')) {
        Sentry.captureMessage(`unknown stateConfig key: ${appStateKey}`);
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
  bagChapter: BagChapter;
  key: string;
}

// Use this hook for loading additional data that needs to be persisted in the state. For example additional data loaded if a user navigates to a detailpage
// that requires fetching data that wasn't retrieved initially.
export function useAppStateBagApi<T extends unknown>({
  url,
  bagChapter,
  key,
}: AppStateBagApiParams) {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  const isApiDataCached =
    typeof appState[bagChapter] !== null &&
    typeof appState[bagChapter] === 'object' &&
    typeof appState[bagChapter] !== 'undefined' &&
    key in appState[bagChapter]!;

  const [api] = useDataApi<ApiResponse<T | null>>(
    {
      url,
      postpone: isApiDataCached,
    },
    apiPristineResult(null)
  );
  useEffect(() => {
    if (!isApiDataCached && !!api.data.content) {
      setAppState((state) => {
        let localState = state[bagChapter];
        if (!localState) {
          localState = {};
        }
        localState = {
          ...localState,
          [key]: api.data.content as T,
        };
        return {
          ...state,
          [bagChapter]: localState,
        };
      });
    }
  }, [isApiDataCached, api, key]);

  return [appState?.[bagChapter]?.[key] as T, api] as const;
}

export function useRemoveAppStateBagData() {
  const [appState, setAppState] = useRecoilState(appStateAtom);
  return useCallback(
    ({ bagChapter, key: keyExpected }: Omit<AppStateBagApiParams, 'url'>) => {
      const local = appState[bagChapter];
      if (!!local) {
        setAppState(
          Object.assign({}, appState, {
            [bagChapter]: Object.fromEntries(
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

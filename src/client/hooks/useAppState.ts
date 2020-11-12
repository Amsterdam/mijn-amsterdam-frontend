import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { atom, SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';
import { AppState, createAllErrorState, PRISTINE_APPSTATE } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';
import { pollBffHealth, useDataApi } from './api/useDataApi';
import { useOptInValue } from './useOptIn';
import { useProfileTypeValue } from './useProfileType';
import { SSE_ERROR_MESSAGE, useSSE } from './useSSE';

// Whenever a client toggles between private and private-commercial profiles, only these servies are requested from the BFF.
const INCREMENTAL_SERVICE_IDS_FOR_PROFILE_TOGGLE = [
  'HOME',
  'AFVAL',
  'AFVALPUNTEN',
  'BUURT',
];

const fallbackServiceRequestOptions = {
  postpone: true,
};

export const appStateAtom = atom<AppState>({
  key: 'appState',
  default: PRISTINE_APPSTATE as AppState,
});

interface useAppStateFallbackServiceProps {
  profileType: ProfileType;
  requestParams: { optin: string; profileType: ProfileType };
  isEnabled: boolean;
  setAppState: SetterOrUpdater<AppState>;
}

export function useAppStateFallbackService({
  profileType,
  requestParams,
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

  const fetchSauron = useCallback(() => {
    return fetchFallbackService({
      ...fallbackServiceRequestOptions,
      url: BFFApiUrls.SERVICES_SAURON,
      postpone: false,
      params: requestParams,
    });
  }, [requestParams, fetchFallbackService]);

  // If no EvenSource support or EventSource fails, the Fallback service endpoint is used for fetching all the data.
  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    // If we have EventSource support but in the case it failed we poll the bff for a health check.
    pollBffHealth()
      .then(() => {
        fetchSauron();
      })
      .catch(appStateError);
  }, [
    fetchFallbackService,
    appStateError,
    fetchSauron,
    isEnabled,
    profileType,
  ]);

  // Update the appState with data fetched by the Fallback service endpoint
  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    if (api.data !== null && !api.isLoading && !api.isError) {
      setAppState((appState) =>
        Object.assign({}, appState, transformSourceData(api.data))
      );
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
export function useAppState() {
  const hasEventSourceSupport = 'EventSource' in window; // IE11 and early edge versions don't have EventSource support. These browsers will use the the Fallback service endpoint.
  const [isFallbackServiceEnabled, setFallbackServiceEnabled] = useState(false);

  const profileType = useProfileTypeValue();
  const isOptIn = useOptInValue();
  const [appState, setAppState] = useRecoilState(appStateAtom);

  // First retrieve all the services specified in the BFF, after that Only retrieve incremental updates
  const useIncremental = useRef(false);

  useEffect(() => {
    useIncremental.current = true;
  }, []);

  // Request params for the BFF
  const requestParams = useMemo(() => {
    return {
      optin: isOptIn ? 'true' : 'false',
      profileType,
      serviceIds:
        useIncremental.current === false
          ? []
          : INCREMENTAL_SERVICE_IDS_FOR_PROFILE_TOGGLE,
    };
    // Omitting optIn here because TIPS api handles OptIn toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileType]);

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

  useEffect(() => {
    if (requestParams.serviceIds.length) {
      setAppState((appState) => {
        const pristineStateSlices: any = {};

        for (const id of requestParams.serviceIds as Array<keyof AppState>) {
          pristineStateSlices[id] = PRISTINE_APPSTATE[id];
        }

        const appStateUpdated = {
          ...appState,
          ...pristineStateSlices,
        };

        return appStateUpdated;
      });
    }
  }, [requestParams, setAppState]);

  useSSE({
    path: BFFApiUrls.SERVICES_SSE,
    eventName: 'message',
    callback: onEvent,
    postpone: isFallbackServiceEnabled,
    requestParams,
  });

  useAppStateFallbackService({
    profileType,
    isEnabled: hasEventSourceSupport ? isFallbackServiceEnabled : true,
    requestParams,
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

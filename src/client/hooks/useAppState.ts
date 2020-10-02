import * as Sentry from '@sentry/browser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  selectorFamily,
  SetterOrUpdater,
} from 'recoil';
import { AppState, createAllErrorState, PRISTINE_APPSTATE } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformAppState } from '../data-transform/appState';
import { pollBffHealth, requestApiData, useDataApi } from './api/useDataApi';
import { useProfileTypeValue } from './useProfileType';
import { SSE_ERROR_MESSAGE, useSSE } from './useSSE';
import { Chapters } from '../../universal/config/chapter';
import { useOptInValue } from './useOptIn';

const fallbackServiceRequestOptions = {
  postpone: true,
  transformResponse: [
    ...requestApiData.defaults.transformResponse,
    transformAppState,
  ],
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
  const [isDataRequested, setIsDataRequested] = useState(false);
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
      setAppState(appState => createAllErrorState(appState, message));
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
    if (!isDataRequested && api.isPristine) {
      // If we have EventSource support but in the case it failed
      pollBffHealth()
        .then(() => {
          fetchSauron();
        })
        .catch(appStateError);
    }
  }, [
    fetchFallbackService,
    api.isPristine,
    isDataRequested,
    appStateError,
    fetchSauron,
    isEnabled,
  ]);

  // Update the appState with data fetched by the Fallback service endpoint
  useEffect(() => {
    if (isDataRequested || !isEnabled) {
      return;
    }
    if (api.data !== null && !api.isLoading && !api.isError) {
      setIsDataRequested(true);
      setAppState(appState => Object.assign({}, appState, api.data));
    } else if (api.isError) {
      // If everything fails, this is the final state update.
      const errorMessage =
        'Services.all endpoint could not be reached or returns an error.';
      setIsDataRequested(true);
      appStateError(errorMessage);
    }
  }, [api, isDataRequested, appStateError, setAppState, isEnabled]);
}

/**
 * The primary communication is the EventSource. In the case the EventSource can't connect to the server, a number of retries will take place.
 * If the EventSource fails the Fallback service endpoint /all will be used in a last attempt to fetch the data needed to display a fruity application.
 * If that fails we just can't connect to the server for whatever reason. Sentry error handling might have information about this scenario.
 */
export function useAppState() {
  const hasEventSourceSupport = 'EventSource' in window; // IE11 and early edge versions don't have EventSource support. These browsers will use the the Fallback service endpoint.
  const [isFallbackServiceEnabled, setFallbackServiceEnabled] = useState(
    !hasEventSourceSupport
  );

  const profileType = useProfileTypeValue();
  const isOptIn = useOptInValue();
  const [appState, setAppState] = useRecoilState(appStateAtom);

  const serviceRequestParams = useMemo(() => {
    return {
      optin: isOptIn ? 'true' : 'false',
      profileType,
    };
  }, [isOptIn, profileType]);

  // The EventSource will only be used if we have EventSource support
  const onEvent = useCallback(
    (messageData: any) => {
      console.log('on event', messageData);
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
    },
    [setAppState]
  );

  const path = BFFApiUrls.SERVICES_SSE;

  useSSE({
    path,
    eventName: 'message',
    callback: onEvent,
    postpone: isFallbackServiceEnabled,
    requestParams: serviceRequestParams,
  });

  useAppStateFallbackService({
    profileType,
    isEnabled: hasEventSourceSupport ? isFallbackServiceEnabled : true,
    requestParams: serviceRequestParams,
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

const appStateNotificationsSelector = selectorFamily({
  key: 'appStateNotifications',
  get: (profileType: ProfileType) => ({ get }) => {
    const appState = get(appStateAtom);

    if (
      profileType === 'private-commercial' &&
      appState.NOTIFICATIONS.content
    ) {
      return appState.NOTIFICATIONS.content.filter(
        notification => notification.chapter !== Chapters.BRP
      );
    }

    return appState.NOTIFICATIONS.content || [];
  },
});

export function useAppStateNotifications() {
  const profileType = useProfileTypeValue();
  return useRecoilValue(appStateNotificationsSelector(profileType));
}

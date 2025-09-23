import { useCallback, useState } from 'react';

import { useAppStateFallbackService } from './useAppStateFallbackServicesAll';
import { useAppStateStore } from './useAppStateStore';
import { SSE_CLOSE_MESSAGE, SSE_ERROR_MESSAGE, useSSE } from './useSSE';
import { streamEndpointQueryParamKeys } from '../../universal/config/app';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';

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

  const { setAppState, setIsAppStateReady } = useAppStateStore();
  // The callback is fired on every incoming message from the EventSource.
  const onEvent = useCallback(
    (messageData: string | object) => {
      if (typeof messageData === 'object') {
        const transformedMessageData = transformSourceData(messageData);
        setAppState(transformedMessageData);
      } else if (messageData === SSE_ERROR_MESSAGE) {
        setFallbackServiceEnabled(true);
      } else if (messageData === SSE_CLOSE_MESSAGE) {
        setIsAppStateReady(true);
      }
    },
    [setAppState, setIsAppStateReady]
  );

  useSSE({
    path: streamEndpoint,
    eventName: 'message',
    callback: onEvent,
    postpone: isFallbackServiceEnabled,
  });

  useAppStateFallbackService({
    isEnabled: hasEventSourceSupport ? isFallbackServiceEnabled : true,
  });
}

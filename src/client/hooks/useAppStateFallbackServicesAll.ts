import { useEffect } from 'react';

import type { AppState } from '../../universal/types/App.types';
import { createAllErrorState } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';
import { captureMessage } from '../helpers/monitoring';
import { useBffApi } from './api/useDataApi-v2';
import { useAppStateStore } from './useAppStateStore';

interface useAppStateFallbackServiceProps {
  profileType: ProfileType;
  isEnabled: boolean;
}

export function useAppStateFallbackService({
  profileType,
  isEnabled,
}: useAppStateFallbackServiceProps) {
  const { setAppState, isReady, ...appState } = useAppStateStore();
  const api = useBffApi<AppState>(BFFApiUrls.SERVICES_SAURON, {
    fetchImmediately: false,
  });

  // If no EvenSource support or EventSource fails, the Fallback service endpoint is used for fetching all the data.
  useEffect(() => {
    console.log(
      `[useAppStateFallbackService] isEnabled: ${isEnabled}, isReady: ${isReady}, isLoading: ${api.isLoading}, isError: ${api.isError}`
    );
    if (!isEnabled || isReady) {
      return;
    }

    if (isEnabled && api.isLoading === false && api.isDirty === false) {
      api.fetch();
    }

    if (api.data !== null && !api.isLoading && !api.isError) {
      setAppState(transformSourceData(api.data.content), true);
    } else if (api.isError) {
      // If everything fails, this is the final state update.
      const errorMessage =
        'Services.all endpoint could not be reached or returns an error.';

      captureMessage('Could not load any data sources.', {
        properties: {
          message: errorMessage,
        },
        severity: 'critical',
      });
      setAppState(createAllErrorState(appState, errorMessage), true);
    }
  }, [api.data, setAppState, isEnabled, api.isDirty, api.isError, isReady]);
}

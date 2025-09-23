import { useEffect } from 'react';

import type { AppState } from '../../universal/types/App.types';
import { createAllErrorState } from '../AppState';
import { BFFApiUrls } from '../config/api';
import { transformSourceData } from '../data-transform/appState';
import { captureMessage } from '../helpers/monitoring';
import { useBffApi } from './api/useBffApi';
import { useAppStateStore } from './useAppStateStore';

interface useAppStateFallbackServiceProps {
  isEnabled: boolean;
}

export function useAppStateFallbackService({
  isEnabled,
}: useAppStateFallbackServiceProps) {
  const { setAppState, isReady, ...appState } = useAppStateStore();
  const api = useBffApi<AppState>(BFFApiUrls.SERVICES_SAURON, {
    fetchImmediately: false,
  });

  // If no EvenSource support or EventSource fails, the Fallback service endpoint is used for fetching all the data.
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.data, setAppState, isEnabled, api.isDirty, api.isError, isReady]);
}

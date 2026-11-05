import { useEffect } from 'react';

import type { AppState } from '../../universal/types/App.types.ts';
import { createAllErrorState } from '../apps/bob/AppState.ts';
import { BFFApiUrls } from '../apps/bob/config/api.ts';
import { transformSourceData } from '../apps/bob/data-transform/appState.tsx';
import { captureMessage } from '../helpers/monitoring.ts';
import { useBffApi } from './api/useBffApi.ts';
import { useAppStateStore } from './useAppStateStore.ts';

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
  // biome-ignore lint/correctness/useExhaustiveDependencies: Preserve the existing hook dependency exclusion.
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
  }, [api.data, setAppState, isEnabled, api.isDirty, api.isError, isReady]);
}

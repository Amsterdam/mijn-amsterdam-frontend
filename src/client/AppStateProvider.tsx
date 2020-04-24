import React, { useState, useCallback } from 'react';
import { AppContext, AppState, PRISTINE_APPSTATE } from './AppState';
import { useDataApi } from './hooks/api/api.hook';
import { BFFApiUrls } from './config/api';
import { ComponentChildren } from '../universal/types';
import { useSSE } from './hooks/useSSE';
import { transformAppState } from './data-transform/appState';

interface AppStateProps {
  children: ComponentChildren;
}

interface MockAppStateProps {
  children: ComponentChildren;
  value: Partial<AppState>;
}

export function MockAppStateProvider({ children, value }: MockAppStateProps) {
  return (
    <AppContext.Provider value={value as AppState}>
      {children}
    </AppContext.Provider>
  );
}

export default function AppStateProvider({ children }: AppStateProps) {
  const [appState, setAppState] = useState<AppState>(PRISTINE_APPSTATE);
  // IE11 and early edge versions don't have EventSource support. These browsers will use the the Sauron endpoint.
  if (!('EventSource' in window)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [api] = useDataApi<AppState | null>(
      {
        url: BFFApiUrls.SERVICES_SAURON,
        transformResponse: transformAppState,
      },
      null
    );
    if (api.data !== null) {
      setAppState(api.data);
    }
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onEvent = useCallback((message: any) => {
      if (message?.data) {
        setAppState((state: any) => ({
          ...state,
          ...transformAppState(JSON.parse(message.data)),
        }));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSSE(BFFApiUrls.SERVICES_SSE, 'message', onEvent);
  }

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

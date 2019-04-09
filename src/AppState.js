import React, { createContext } from 'react';
import { useBrpApi } from 'hooks/brp-api.hook.js';
import useSessionApi from 'hooks/session.api.hook.js';
import useMyUpdatesApi from 'hooks/my-updates-api.hook';
import useMyCasesApi from 'hooks/my-cases-api.hook';
import useMyTipsApi from 'hooks/my-tips-api.hook';

export const AppContext = createContext();
export const SessionContext = createContext();

export function SessionState({ render }) {
  const session = useSessionApi();
  return (
    <SessionContext.Provider value={session}>
      {render(session)}
    </SessionContext.Provider>
  );
}

export default function AppState({ render, children, value, session }) {
  // State that needs to be shared across multiple components.
  const appState = value || {
    BRP: useBrpApi(),
    SESSION: session,

    // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component.
    MY_UPDATES: useMyUpdatesApi(),
    MY_CASES: useMyCasesApi(),
    MY_TIPS: useMyTipsApi(),
  };

  return (
    <AppContext.Provider value={appState}>
      {render ? render(appState) : children}
    </AppContext.Provider>
  );
}

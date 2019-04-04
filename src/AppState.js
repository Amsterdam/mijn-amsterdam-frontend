import React, { createContext } from 'react';
import { useBrpApi } from 'hooks/brp-api.hook.js';
import useSessionApi from 'hooks/session.api.hook.js';
import useMijnUpdatesApi from 'hooks/mijn-updates-api.hook';
import useMyCasesApi from 'hooks/my-cases-api.hook';
import useMyTipsApi from 'hooks/my-tips-api.hook';

export const AppContext = createContext();

export default function AppState({ children, value }) {
  // State that needs to be shared across multiple components.
  const appState = value || {
    BRP: useBrpApi(),
    SESSION: useSessionApi(),

    // NOTE: If needed we can postpone immediate fetching of below data and start fetching in the component.
    MY_UPDATES: useMijnUpdatesApi(),
    MY_CASES: useMyCasesApi(),
    MY_TIPS: useMyTipsApi(),
  };

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

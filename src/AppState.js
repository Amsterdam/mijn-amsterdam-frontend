import React, { createContext } from 'react';
import { useBrpApi } from 'hooks/brp-api.hook.js';
import useSessionApi from 'hooks/session.api.hook.js';
import useMijnUpdatesApi from 'hooks/mijn-updates-api.hook';

export const AppContext = createContext();

export default function AppState({ children, value }) {
  // State that needs to be shared across multiple components.
  const appState = value || {
    BRP: useBrpApi(),
    SESSION: useSessionApi(),
    MY_UPDATES: useMijnUpdatesApi(),
  };

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

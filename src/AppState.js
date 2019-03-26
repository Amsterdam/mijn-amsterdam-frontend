import React, { createContext } from 'react';
import { useBrpApi } from 'hooks/brp-api.hook.js';
import useSessionApi from 'hooks/session.api.hook.js';

export const AppContext = createContext();

export default function AppState({ children, value }) {
  // State that needs to be available everywhere
  const appState = value || {
    BRP: useBrpApi(),
    SESSION: useSessionApi(),
  };

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

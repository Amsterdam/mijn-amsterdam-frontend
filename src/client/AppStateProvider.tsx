import React from 'react';
import { ComponentChildren } from '../universal/types';
import { AppContext, AppState } from './AppState';
import { useAppState } from './hooks/useAppState';

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
  const appState = useAppState();

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
}

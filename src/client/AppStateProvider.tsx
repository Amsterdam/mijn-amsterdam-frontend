import React from 'react';
import { AppContext, useAppState, AppState } from './AppState';
import { ComponentChildren } from '../universal/types/App.types';

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
  return (
    <AppContext.Provider value={appState as any}>
      {children}
    </AppContext.Provider>
  );
}

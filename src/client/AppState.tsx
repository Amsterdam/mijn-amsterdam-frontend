import React, { createContext } from 'react';
import {
  ServicesDirectData,
  useServicesDirect,
} from './hooks/api/api.services-direct';
import { ServicesMapData, useServicesMap } from './hooks/api/api.services-map';
import {
  ServicesRelatedData,
  useServicesRelated,
} from './hooks/api/api.services-related';
import {
  ServicesTipsData,
  useServicesTips,
} from './hooks/api/api.services-tips';
import {
  ServicesUpdatesData,
  useServicesUpdates,
} from './hooks/api/api.services-updates';

import { ChaptersState } from './config/myChapters';
import { ComponentChildren } from '../universal/types/App.types';

export interface AppState extends ServicesRelatedData, ServicesDirectData {
  TIPS: ServicesTipsData;
  CHAPTERS: ChaptersState;
  BUURT: ServicesMapData;
  UPDATES: ServicesUpdatesData;
}
export type StateKey = keyof AppState;

export const AppContext = createContext<AppState>({} as AppState);

interface AppStateProps {
  children: ComponentChildren;
}

interface MockAppStateProps {
  children: ComponentChildren;
  value: Partial<AppState>;
}

export function useAppState(): AppState {
  const servicesRelatedApi = useServicesRelated();
  const servicesDirectApi = useServicesDirect();
  const tipsApi = useServicesTips();
  const updatesApi = useServicesUpdates();
  const mapData = useServicesMap();

  return {
    ...servicesRelatedApi.data,
    ...servicesDirectApi.data,
    TIPS: tipsApi.data,
    UPDATES: updatesApi.data,
    CHAPTERS: {
      isLoading: true,
      items: [],
    },
    BUURT: mapData,
  };
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

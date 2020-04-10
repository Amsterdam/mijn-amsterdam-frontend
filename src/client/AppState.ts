import { createContext } from 'react';
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
  ServicesGeneratedData,
  useServicesGenerated,
} from './hooks/api/api.services-generated';

export interface AppState
  extends ServicesRelatedData,
    ServicesDirectData,
    ServicesGeneratedData {
  BUURT: ServicesMapData;
}
export type StateKey = keyof AppState;

export const AppContext = createContext<AppState>({} as AppState);

export function useAppState() {
  const servicesRelatedApi = useServicesRelated();
  const servicesDirectApi = useServicesDirect();
  const servicesGeneratedApi = useServicesGenerated();
  const mapData = useServicesMap();

  return {
    ...servicesRelatedApi.data,
    ...servicesDirectApi.data,
    ...servicesGeneratedApi.data,
    BUURT: mapData,
  };
}

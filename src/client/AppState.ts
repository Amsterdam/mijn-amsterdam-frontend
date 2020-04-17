import { createContext, useCallback, useState } from 'react';
import {
  ServicesDirectData,
  useServicesDirect,
} from './hooks/api/api.services-direct';
import {
  ServicesRelatedData,
  useServicesRelated,
} from './hooks/api/api.services-related';
import {
  ServicesGeneratedData,
  useServicesGenerated,
} from './hooks/api/api.services-generated';
import { ServicesMapData, useServicesMap } from './hooks/api/api.services-map';
import { useSSEEvent } from './hooks/useSSE';

export interface AppState
  extends ServicesRelatedData,
    ServicesDirectData,
    ServicesGeneratedData,
    ServicesMapData {}

export type StateKey = keyof AppState;

export const AppContext = createContext<AppState>({} as AppState);

export function useAppState(postponeAll: boolean = false) {
  const servicesRelatedApi = useServicesRelated(postponeAll);
  const servicesDirectApi = useServicesDirect(postponeAll);
  const servicesGeneratedApi = useServicesGenerated(postponeAll);
  const servicesMapApi = useServicesMap(postponeAll);

  return {
    ...servicesRelatedApi.data,
    ...servicesDirectApi.data,
    ...servicesGeneratedApi.data,
    ...servicesMapApi.data,
  };
}
export function useAppStateSSE() {
  const pristineState = useAppState(true);
  const [state, setAppState] = useState<any>(pristineState);

  const onEvent = useCallback((message: any) => {
    console.log(message);
    if (message?.data) {
      console.log(message.lastEventId, JSON.parse(message.data));
      setAppState((state: any) => ({
        ...state,
        [message.lastEventId]: JSON.parse(message.data),
      }));
    }
  }, []);

  console.log('sse!');

  useSSEEvent('http://localhost:5000/stream', 'message', onEvent);

  return state;
}

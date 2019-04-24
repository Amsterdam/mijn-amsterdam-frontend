import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiState } from './api.types';

export interface SessionState {
  isAuthenticated?: boolean;
}

const INITIAL_SESSION_STATE: SessionState = {
  isAuthenticated: false,
};

export type SessionApiState = ApiState & SessionState;

export default function useSessionApi(
  initialData = INITIAL_SESSION_STATE
): SessionApiState {
  const { data, ...rest } = useDataApi({ url: ApiUrls.AUTH }, initialData);
  return { ...data, ...rest };
}

import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiHookState } from './api.types';

export interface SessionState {
  isAuthenticated?: boolean;
}

const INITIAL_SESSION_STATE: SessionState = {
  isAuthenticated: false,
};

export type SessionApiState = ApiHookState & SessionState;

export default function useSessionApi(
  initialData = INITIAL_SESSION_STATE
): SessionApiState {
  const { data, ...rest } = useDataApi({ url: ApiUrls.AUTH }, initialData);
  return { ...data, ...rest };
}

import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiState, ApiRequestOptions } from './api.types';

export interface SessionState {
  isAuthenticated?: boolean;
  refetch: () => void;
}

const INITIAL_SESSION_STATE: Omit<SessionState, 'refetch'> = {
  isAuthenticated: false,
};

const requestOptions: ApiRequestOptions = {
  url: ApiUrls.AUTH,
  resetToInitialDataOnError: true,
};

export type SessionApiState = ApiState & SessionState;

export default function useSessionApi(
  initialData = INITIAL_SESSION_STATE
): SessionApiState {
  const [{ data, ...rest }, refetch] = useDataApi(requestOptions, initialData);
  return { ...data, ...rest, refetch: () => refetch(requestOptions) };
}

import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';

export interface SessionState {
  isAuthenticated: boolean;
}

const INITIAL_SESSION_STATE: SessionState = {
  isAuthenticated: false,
};

export default function useSessionApi(initialData = INITIAL_SESSION_STATE) {
  const { data, ...rest } = useDataApi({ url: ApiUrls.AUTH }, initialData);
  return { ...data, ...rest };
}

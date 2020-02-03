import { AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS } from 'components/AutoLogoutDialog/AutoLogoutDialog';
import { getApiUrl } from 'helpers/App';
import { useMemo } from 'react';
import { useDataApi } from './api.hook';
import { ApiRequestOptions, ApiState } from './api.types';

export interface SessionResponse {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
}

export interface SessionState {
  refetch: () => void;
}

const INITIAL_SESSION_STATE = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
};

const requestOptions: ApiRequestOptions = {
  url: getApiUrl('AUTH'),
  resetToInitialDataOnError: true,
};

export type SessionApiState = Omit<ApiState<null>, 'data'> &
  SessionState &
  SessionResponse;

export default function useSessionApi(): SessionApiState {
  const [{ data, isLoading, isDirty, ...rest }, refetch] = useDataApi<
    SessionResponse
  >(requestOptions, INITIAL_SESSION_STATE);

  const { isAuthenticated, validUntil } = data;

  return useMemo(() => {
    const validityInSeconds = Math.max(
      Math.round(
        (validUntil - new Date().getTime()) / 1000 -
          AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS
      ),
      0
    );

    return {
      ...rest,
      isLoading,
      isAuthenticated,
      validUntil,
      validityInSeconds,
      isDirty,
      refetch: () => refetch(requestOptions),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validUntil, isLoading]);
}

import { AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS } from 'components/AutoLogoutDialog/AutoLogoutDialog';
import { useMemo } from 'react';
import { getApiUrl } from '../../helpers/App';
import { useDataApi } from './api.hook';
import { ApiRequestOptions, ApiState } from './api.types';

export interface SessionState {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  refetch: () => void;
}

const INITIAL_SESSION_STATE: Omit<SessionState, 'refetch'> = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
};

const requestOptions: ApiRequestOptions = {
  url: getApiUrl('AUTH'),
  resetToInitialDataOnError: true,
};

export type SessionApiState = Omit<ApiState, 'data'> & SessionState;

export default function useSessionApi(
  initialData = INITIAL_SESSION_STATE
): SessionApiState {
  const [
    {
      data: { isAuthenticated, validUntil },
      isLoading,
      isDirty,
      ...rest
    },
    refetch,
  ] = useDataApi(requestOptions, initialData);

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
  }, [isAuthenticated, isDirty]);
}

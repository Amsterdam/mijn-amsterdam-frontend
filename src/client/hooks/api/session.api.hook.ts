import { ApiRequestOptions, ApiState } from './api.types';

import { ApiUrls } from '../../../universal/config/api';
import { useDataApi } from './api.hook';
import { useMemo } from 'react';

export interface SessionResponse {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  userType: 'BURGER' | 'BEDRIJF';
}

export interface SessionState {
  refetch: () => void;
}

const INITIAL_SESSION_STATE: SessionResponse = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
  userType: 'BURGER',
};

const requestOptions: ApiRequestOptions = {
  url: ApiUrls.AUTH,
  resetToInitialDataOnError: true,
};

export type SessionApiState = Omit<ApiState<null>, 'data'> &
  SessionState &
  SessionResponse;

export default function useSessionApi(): SessionApiState {
  const [{ data, isLoading, isDirty, ...rest }, refetch] = useDataApi<
    SessionResponse
  >(requestOptions, INITIAL_SESSION_STATE);

  const { isAuthenticated, validUntil, userType } = data;

  return useMemo(() => {
    const validityInSeconds = Math.max(
      Math.round((validUntil - new Date().getTime()) / 1000),
      0
    );

    return {
      ...rest,
      isLoading,
      isAuthenticated,
      validUntil,
      validityInSeconds,
      isDirty,
      userType,
      refetch: () => refetch(requestOptions),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validUntil, isLoading]);
}

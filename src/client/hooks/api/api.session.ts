import { useMemo } from 'react';
import {
  ApiErrorResponse,
  apiSuccesResult,
  apiPristineResult,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import { ApiRequestOptions, useDataApi } from './api.hook';
import { AUTH_API_URL } from '../../config/api';

export type SessionData = {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  userType: 'BURGER' | 'BEDRIJF';
};

export interface SessionState {
  refetch: () => void;
}

const INITIAL_SESSION_STATE = {
  SESSION: apiPristineResult({
    isAuthenticated: false,
    validUntil: -1,
    validityInSeconds: -1,
    userType: 'BURGER',
  }),
};

const requestOptions: ApiRequestOptions = {
  url: AUTH_API_URL,
  transformResponse(data) {
    return {
      SESSION: apiSuccesResult<SessionData>(data),
    };
  },
};

type SessionResponseData =
  | Record<
      'SESSION',
      ApiSuccessResponse<SessionData> | ApiErrorResponse<SessionData>
    >
  | typeof INITIAL_SESSION_STATE;

export function useSessionApi() {
  const [{ data, isLoading, isDirty, ...rest }, refetch] = useDataApi<
    SessionResponseData
  >(requestOptions, INITIAL_SESSION_STATE);

  const { isAuthenticated, validUntil, userType } = data.SESSION.content!; // SESSION.content is never null

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

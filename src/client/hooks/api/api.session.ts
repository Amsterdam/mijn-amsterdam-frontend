import { useMemo } from 'react';
import {
  ApiErrorResponse,
  apiPristineResult,
  apiSuccesResult,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import { AUTH_API_URL } from '../../config/api';
import { ApiRequestOptions, requestApiData, useDataApi } from './api.hook';

export type SessionData = {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  userType: 'BURGER' | 'BEDRIJF';
};

export interface SessionState {
  refetch: () => void;
}
const INITIAL_SESSION_CONTENT: SessionData = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
  userType: 'BURGER',
};
const INITIAL_SESSION_STATE = {
  SESSION: apiPristineResult(INITIAL_SESSION_CONTENT),
};

const requestOptions: ApiRequestOptions = {
  url: AUTH_API_URL,
  responseType: 'text',
  transformResponse: [
    ...requestApiData.defaults.transformResponse,
    (data: SessionData) => {
      return {
        SESSION: apiSuccesResult<SessionData>(data),
      };
    },
  ],
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

  const { isAuthenticated, validUntil, userType } =
    typeof data.SESSION?.content !== 'string' &&
    data !== null &&
    data.SESSION.content !== null
      ? data.SESSION.content
      : INITIAL_SESSION_CONTENT;

  return useMemo(() => {
    const validityInSeconds = validUntil
      ? Math.max(Math.round((validUntil - new Date().getTime()) / 1000), 0)
      : 0;

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

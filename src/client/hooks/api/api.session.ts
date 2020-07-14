import { useMemo, useEffect } from 'react';
import {
  ApiErrorResponse,
  apiSuccesResult,
  apiPristineResult,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import { ApiRequestOptions, useDataApi, requestApiData } from './api.hook';
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
  } as SessionData),
};

const requestOptions: ApiRequestOptions = {
  url: AUTH_API_URL,
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
    SessionResponseData | string
  >(requestOptions, INITIAL_SESSION_STATE);

  let redirectThroughRoute: string = '';
  console.log('session data', data);
  if (typeof data === 'string') {
    const reg = new RegExp(/top\.location="(.*)"/gi);
    const matches = reg.exec(data as string);
    const matchedUrl = matches && matches[1];
    if (matchedUrl) {
      redirectThroughRoute = matchedUrl;
    }
  }

  useEffect(() => {
    if (redirectThroughRoute) {
      console.log('refetch:', redirectThroughRoute);
      refetch({
        ...requestOptions,
        url: redirectThroughRoute,
      });
    }
  }, [refetch, redirectThroughRoute]);

  const { isAuthenticated, validUntil, userType } = (typeof data !== 'string' &&
    data?.SESSION.content) || {
    isAuthenticated: false,
  };

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

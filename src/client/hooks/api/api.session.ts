import { ApiRequestOptions, useDataApi } from './api.hook';

import { ApiUrls } from '../../../universal/config/api';
import { useMemo } from 'react';
import {
  apiSuccesResult,
  apiPristineResponseData,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../../universal/helpers/api';

export type SessionData = {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  userType: 'BURGER' | 'BEDRIJF';
};

export interface SessionState {
  refetch: () => void;
}

const INITIAL_SESSION_STATE = apiPristineResponseData({
  SESSION: {
    isAuthenticated: false,
    validUntil: -1,
    validityInSeconds: -1,
    userType: 'BURGER',
  },
});

const requestOptions: ApiRequestOptions = {
  url: ApiUrls.AUTH,
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

export default function useSessionApi() {
  const [{ data, isLoading, isDirty, ...rest }, refetch] = useDataApi<
    SessionResponseData
  >(requestOptions, INITIAL_SESSION_STATE);

  const { isAuthenticated, validUntil, userType } = data.SESSION.content;

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

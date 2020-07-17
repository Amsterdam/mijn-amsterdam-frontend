import Cookies from 'js-cookie';
import { useEffect, useMemo } from 'react';
import { COOKIE_KEY_COMMERCIAL_LOGIN } from '../../../universal/config';
import {
  ApiErrorResponse,
  apiPristineResult,
  apiSuccesResult,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import {
  AUTH_API_URL,
  IS_COMMERCIAL_PATH_MATCH,
  LOGOUT_URL,
} from '../../config/api';
import { ApiRequestOptions, requestApiData, useDataApi } from './useDataApi';

export type SessionData = {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  userType: 'BURGER' | 'BEDRIJF';
};

export interface SessionState {
  refetch: () => void;
  logout: () => void;
}

type SessionResponseData =
  | Record<
      'SESSION',
      ApiSuccessResponse<SessionData> | ApiErrorResponse<SessionData>
    >
  | typeof INITIAL_SESSION_STATE;

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

function setExplicitLogout() {
  Cookies.remove(COOKIE_KEY_COMMERCIAL_LOGIN);
  (window as any).isExplicitLogout = true;
}

function isExplicitLogout() {
  return !!(window as any).isExplicitLogout;
}

function saveUserTypeForReloadingAndNewTabs(maxAge: number) {
  if (IS_COMMERCIAL_PATH_MATCH && !isExplicitLogout()) {
    Cookies.set(COOKIE_KEY_COMMERCIAL_LOGIN, 'yes', {
      'Max-age': '' + maxAge,
    });
  }
}

function logoutSession() {
  setExplicitLogout();
  window.location.href = LOGOUT_URL;
}

function getValidityInSeconds(validUntil: number) {
  return validUntil
    ? Math.max(Math.round((validUntil - new Date().getTime()) / 1000), 0)
    : 0;
}

export function useSessionApi() {
  const [{ data, isLoading, isDirty, ...rest }, refetch] = useDataApi<
    SessionResponseData
  >(requestOptions, INITIAL_SESSION_STATE);

  const hasValidSessionData =
    typeof data.SESSION?.content !== 'string' &&
    data !== null &&
    data.SESSION.content !== null;

  const { isAuthenticated, validUntil, userType } = hasValidSessionData
    ? data.SESSION.content!
    : INITIAL_SESSION_CONTENT;

  const sessionValidMaxAge = getValidityInSeconds(
    data.SESSION.content?.validUntil || INITIAL_SESSION_CONTENT.validUntil
  );

  useEffect(() => {
    const onBeforeUnload = () => {
      if (sessionValidMaxAge > 0) {
        saveUserTypeForReloadingAndNewTabs(sessionValidMaxAge);
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [sessionValidMaxAge]);

  return useMemo(() => {
    return {
      ...rest,
      isLoading,
      isAuthenticated,
      validUntil,
      validityInSeconds: sessionValidMaxAge,
      isDirty,
      userType,
      refetch: () => refetch(requestOptions),
      logout: () => logoutSession(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validUntil, sessionValidMaxAge, isLoading]);
}

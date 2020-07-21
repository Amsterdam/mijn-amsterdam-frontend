import Cookies from 'js-cookie';
import { useEffect, useCallback } from 'react';
import { atom, useRecoilState } from 'recoil';
import { COOKIE_KEY_COMMERCIAL_LOGIN } from '../../../universal/config';
import {
  AUTH_API_URL,
  IS_COMMERCIAL_PATH_MATCH,
  LOGOUT_URL,
} from '../../config/api';
import { ApiRequestOptions, useDataApi, requestApiData } from './useDataApi';
import { ApiSuccessResponse } from '../../../universal/helpers';
import { clearSessionStorage } from '../storage.hook';
import {
  apiSuccesResult,
  ApiErrorResponse,
} from '../../../universal/helpers/api';

export type SessionData = {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  userType: 'BURGER' | 'BEDRIJF';
};

const INITIAL_SESSION_CONTENT: SessionData = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
  userType: 'BURGER',
};

export interface SessionState extends SessionData {
  refetch: () => void;
  logout: () => void;
  isPristine: boolean;
  isDirty: boolean;
  isLoading: boolean;
}

const INITIAL_SESSION_STATE: SessionState = {
  ...INITIAL_SESSION_CONTENT,
  isLoading: true,
  isPristine: true,
  isDirty: false,
  refetch: () => void 0,
  logout: () => void 0,
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

type SessionResponseData = Record<
  'SESSION',
  ApiSuccessResponse<SessionData> | ApiErrorResponse<SessionData>
>;

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

function getValidityInSeconds(validUntil: number) {
  return validUntil
    ? Math.max(Math.round((validUntil - new Date().getTime()) / 1000), 0)
    : 0;
}

export const sessionAtom = atom<SessionState>({
  key: 'sessionState',
  default: INITIAL_SESSION_STATE,
});

export function useSessionApi() {
  const [sessionResponse, refetch] = useDataApi<SessionResponseData>(
    requestOptions,
    { SESSION: apiSuccesResult(INITIAL_SESSION_CONTENT) }
  );
  const {
    data: {
      SESSION: { content: sessionData },
    },
    isLoading,
    isDirty,
    isPristine,
  } = sessionResponse;

  const [session, setSession] = useSessionAtom();

  const sessionValidMaxAge = getValidityInSeconds(
    sessionData.validUntil || INITIAL_SESSION_CONTENT.validUntil
  );

  const logoutSession = useCallback(() => {
    setExplicitLogout();
    clearSessionStorage();
    window.location.href = LOGOUT_URL;
  }, []);

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

  useEffect(() => {
    setSession(() => ({
      ...sessionData,
      validityInSeconds: sessionValidMaxAge,
      isLoading,
      isDirty,
      isPristine,
      refetch: () => refetch({ ...requestOptions, postpone: false }),
      logout: () => logoutSession(),
    }));
  }, [
    sessionData,
    sessionValidMaxAge,
    isLoading,
    isDirty,
    isPristine,
    refetch,
    setSession,
  ]);

  return session;
}

export function useSessionAtom() {
  return useRecoilState(sessionAtom);
}

export function useSessionValue() {
  return useRecoilState(sessionAtom)[0];
}

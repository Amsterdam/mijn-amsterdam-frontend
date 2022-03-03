import Cookies from 'js-cookie';
import { useCallback, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AuthType, COOKIE_KEY_AUTH_TYPE } from '../../../universal/config';
import { ApiSuccessResponse } from '../../../universal/helpers';
import {
  ApiErrorResponse,
  apiSuccesResult,
} from '../../../universal/helpers/api';
import {
  AUTH_API_URL,
  IS_COMMERCIAL_PATH_MATCH,
  IS_IRMA_PATH_MATCH,
  LOGOUT_URL,
} from '../../config/api';
import { clearSessionStorage } from '../storage.hook';
import { clearDeeplinkEntry } from '../useDeeplink.hook';
import { ApiRequestOptions, useDataApi } from './useDataApi';

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

export const INITIAL_SESSION_STATE: SessionState = {
  ...INITIAL_SESSION_CONTENT,
  isLoading: true,
  isPristine: true,
  isDirty: false,
  refetch: () => void 0,
  logout: () => void 0,
};

const requestOptions: ApiRequestOptions = {
  url: AUTH_API_URL,
};

type SessionResponseData =
  | ApiSuccessResponse<SessionData>
  | ApiErrorResponse<SessionData>;

function setExplicitLogout() {
  Cookies.remove(COOKIE_KEY_AUTH_TYPE);
  (window as any).isExplicitLogout = true;
}

function isExplicitLogout() {
  return !!(window as any).isExplicitLogout;
}

function saveUserTypeForReloadingAndNewTabs(maxAge: number) {
  if (!isExplicitLogout()) {
    Cookies.set(
      COOKIE_KEY_AUTH_TYPE,
      IS_COMMERCIAL_PATH_MATCH
        ? AuthType.EHERKENNING
        : IS_IRMA_PATH_MATCH
        ? AuthType.IRMA
        : AuthType.DIGID,
      {
        'Max-age': '' + maxAge,
        sameSite: 'Strict',
      }
    );
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
    apiSuccesResult(INITIAL_SESSION_CONTENT)
  );
  const { data, isLoading, isDirty, isPristine } = sessionResponse;
  const sessionData = data?.content;
  const [session, setSession] = useSessionAtom();

  const sessionValidMaxAge = getValidityInSeconds(
    sessionData.validUntil || INITIAL_SESSION_CONTENT.validUntil
  );

  const logoutSession = useCallback(() => {
    setExplicitLogout();
    clearSessionStorage();
    clearDeeplinkEntry();
    window.location.href = LOGOUT_URL;
  }, []);

  useEffect(() => {
    saveUserTypeForReloadingAndNewTabs(sessionValidMaxAge);
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
    logoutSession,
  ]);

  return session;
}

export function useSessionAtom() {
  return useRecoilState(sessionAtom);
}

export function useSessionValue() {
  return useRecoilState(sessionAtom)[0];
}

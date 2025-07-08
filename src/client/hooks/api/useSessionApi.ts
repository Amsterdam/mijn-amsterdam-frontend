import { useCallback, useEffect } from 'react';

import { atom, useRecoilState } from 'recoil';

import { AuthProfile } from '../../../server/auth/auth-types.ts';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { AUTH_API_URL, LOGOUT_URL } from '../../config/api.ts';
import { clearSessionStorage } from '../storage.hook.ts';
import { clearDeeplinkEntry } from '../useDeeplink.hook.ts';
import { useProfileType } from '../useProfileType.ts';
import { ApiRequestOptions, useDataApi } from './useDataApi.ts';

export const ONE_SECOND_MS = 1000;

export type SessionData = {
  isAuthenticated: boolean;
  profileType: ProfileType | null;
  authMethod: AuthProfile['authMethod'] | null;
  expiresAtMilliseconds: number; // In milliseconds
};

const INITIAL_SESSION_CONTENT: SessionData = {
  isAuthenticated: false,
  profileType: null,
  authMethod: null,
  expiresAtMilliseconds: 0,
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

type SessionResponseData =
  | ApiSuccessResponse<SessionData>
  | ApiErrorResponse<SessionData>;

export const sessionAtom = atom<SessionState>({
  key: 'sessionState',
  default: INITIAL_SESSION_STATE,
});

const requestOptions: ApiRequestOptions = {
  monitoringEnabled: false, // Disable Monitoring for auth check responses
  url: AUTH_API_URL,
};

export function useSessionApi(): SessionState {
  const [sessionResponse, fetch] = useDataApi<SessionResponseData | null>(
    requestOptions,
    apiSuccessResult(INITIAL_SESSION_CONTENT)
  );

  const { data, isLoading, isDirty, isPristine } = sessionResponse;
  const sessionData = data?.content;
  const [session, setSession] = useSessionAtom();
  const [, setProfileType] = useProfileType();

  useEffect(() => {
    if (sessionData?.profileType) {
      setProfileType(sessionData.profileType);
    }
  }, [setProfileType, sessionData?.profileType]);

  const logoutSession = useCallback(() => {
    clearSessionStorage();
    clearDeeplinkEntry();
    globalThis.location.href = `${LOGOUT_URL}?authMethod=${sessionData?.authMethod}`;
  }, [sessionData?.authMethod]);

  const isAuthenticated = sessionData?.isAuthenticated;

  const checkAuthentication = useCallback(() => {
    fetch({
      url: AUTH_API_URL,
      postpone: false,
    });
  }, [fetch]);

  useEffect(() => {
    const checkAway = () => {
      if (document.body.classList.contains('is-away')) {
        document.body.classList.remove('is-away');
        checkAuthentication();
      }
    };

    const addAway = () => {
      document.body.classList.add('is-away');
    };

    globalThis.addEventListener('focus', checkAway);
    globalThis.addEventListener('blur', addAway);

    return () => {
      globalThis.removeEventListener('focus', checkAway);
      globalThis.removeEventListener('blur', addAway);
    };
  }, []);

  useEffect(() => {
    if (sessionData) {
      setSession(() => ({
        ...sessionData,
        isLoading,
        isDirty,
        isPristine,
        refetch: checkAuthentication,
        logout: () => logoutSession(),
      }));
    }
  }, [
    isAuthenticated,
    isLoading,
    isDirty,
    isPristine,
    fetch,
    setSession,
    logoutSession,
    checkAuthentication,
  ]);

  return session;
}

export function useSessionAtom() {
  return useRecoilState(sessionAtom);
}

export function useSessionValue() {
  return useRecoilState(sessionAtom)[0];
}

import { useCallback, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { AuthProfile } from '../../../server/helpers/app';
import { ApiSuccessResponse } from '../../../universal/helpers';
import {
  ApiErrorResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AUTH_API_URL, LOGOUT_URL } from '../../config/api';
import { clearSessionStorage } from '../storage.hook';
import { clearDeeplinkEntry } from '../useDeeplink.hook';
import { useProfileType } from '../useProfileType';
import { ApiRequestOptions, useDataApi } from './useDataApi';

export type SessionData = {
  isAuthenticated: boolean;
  profileType: ProfileType | null;
  authMethod: AuthProfile['authMethod'] | null;
};

const INITIAL_SESSION_CONTENT: SessionData = {
  isAuthenticated: false,
  profileType: null,
  authMethod: null,
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
  sentryEnabled: false, // Disable Sentry for auth check responses
  url: AUTH_API_URL,
};

export function useSessionApi() {
  const [sessionResponse, fetch] = useDataApi<SessionResponseData>(
    requestOptions,
    apiSuccessResult(INITIAL_SESSION_CONTENT)
  );

  const { data, isLoading, isDirty, isPristine } = sessionResponse;
  const sessionData = data?.content;
  const [session, setSession] = useSessionAtom();
  const [, setProfileType] = useProfileType();

  useEffect(() => {
    if (sessionData.profileType) {
      setProfileType(sessionData.profileType);
    }
  }, [setProfileType, sessionData.profileType]);

  const logoutSession = useCallback(() => {
    clearSessionStorage();
    clearDeeplinkEntry();
    window.location.href = `${LOGOUT_URL}?authMethod=${sessionData.authMethod}`;
  }, [sessionData.authMethod]);

  useEffect(() => {
    const checkAuthentication = () => {
      fetch({
        url: AUTH_API_URL,
        postpone: false,
      });
    };

    const checkAway = () => {
      if (document.body.classList.contains('is-away')) {
        document.body.classList.remove('is-away');
        checkAuthentication();
      }
    };

    const addAway = () => {
      document.body.classList.add('is-away');
    };

    setSession(() => ({
      ...sessionData,
      isLoading,
      isDirty,
      isPristine,
      refetch: checkAuthentication,
      logout: () => logoutSession(),
    }));

    window.addEventListener('focus', checkAway);
    window.addEventListener('blur', addAway);

    return () => {
      window.removeEventListener('focus', checkAway);
      window.removeEventListener('blur', addAway);
    };
  }, [
    sessionData,
    isLoading,
    isDirty,
    isPristine,
    fetch,
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

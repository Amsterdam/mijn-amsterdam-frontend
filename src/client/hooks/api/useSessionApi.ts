import { useEffect } from 'react';

import { AuthProfile } from '../../../server/auth/auth-types';
import { AUTH_API_URL, LOGOUT_URL } from '../../config/api';
import { clearSessionStorage } from '../storage.hook';
import { clearDeeplinkEntry } from '../useDeeplink.hook';
import { useProfileType } from '../useProfileType';
import { createGetApiHook } from './useDataApi-v2';

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

const useSessionApiFetcher = createGetApiHook<SessionData>({
  defaultUrl: AUTH_API_URL,
});

export function useSessionApi() {
  const sessionApi = useSessionApiFetcher();
  const { data, fetch } = sessionApi;
  const sessionData = data?.content ?? null;
  const { setProfileType } = useProfileType();

  useEffect(() => {
    // Fetch initial
    sessionApi.fetch();
  }, []);

  useEffect(() => {
    if (sessionData?.profileType) {
      setProfileType(sessionData.profileType);
    }
  }, [setProfileType, sessionData?.profileType]);

  useEffect(() => {
    const checkAway = () => {
      if (document.body.classList.contains('is-away')) {
        document.body.classList.remove('is-away');
        fetch();
      }
    };

    const addAway = () => {
      document.body.classList.add('is-away');
    };

    window.addEventListener('focus', checkAway);
    window.addEventListener('blur', addAway);

    return () => {
      window.removeEventListener('focus', checkAway);
      window.removeEventListener('blur', addAway);
    };
  }, []);

  return {
    ...sessionApi,
    ...sessionData,
  };
}

export function useLogout() {
  return () => {
    clearSessionStorage();
    clearDeeplinkEntry();
    window.location.href = LOGOUT_URL;
  };
}

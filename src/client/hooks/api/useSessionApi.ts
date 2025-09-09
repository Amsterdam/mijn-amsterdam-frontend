import { useEffect } from 'react';

import { AuthProfile } from '../../../server/auth/auth-types';
import { AUTH_API_URL, LOGOUT_URL } from '../../config/api';
import { clearSessionStorage } from '../storage.hook';
import { clearDeeplinkEntry } from '../useDeeplink.hook';
import { useProfileType } from '../useProfileType';
import { createApiHook } from './useDataApi-v2';

export const ONE_SECOND_MS = 1000;

export type SessionData = {
  isAuthenticated: boolean;
  profileType: ProfileType | null;
  authMethod: AuthProfile['authMethod'] | null;
  expiresAtMilliseconds: number; // In milliseconds
};

const useSessionApiFetcher = createApiHook<SessionData>({
  defaultUrl: AUTH_API_URL,
});

export function useSessionApi() {
  const sessionApi = useSessionApiFetcher();
  const { data, fetch } = sessionApi;
  const sessionData = data?.content ?? null;
  const { setProfileType } = useProfileType();

  useEffect(() => {
    if (sessionApi.isPristine) {
      // Fetch initial
      sessionApi.fetch();
    }
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
    isPristine: sessionApi.isPristine,
    isAuthenticated: sessionData?.isAuthenticated ?? false,
    expiresAtMilliseconds: sessionData?.expiresAtMilliseconds ?? 0,
  };
}

export function useLogout() {
  return () => {
    clearSessionStorage();
    clearDeeplinkEntry();
    window.location.href = LOGOUT_URL;
  };
}

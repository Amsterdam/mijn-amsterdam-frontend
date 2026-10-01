import { useEffect } from 'react';

import type { AuthProfile } from '../../../server/auth/auth-types.ts';
import { clearSessionStorage } from '../storage.hook.ts';
import { clearDeeplinkEntry } from '../useDeeplink.hook.ts';
import { useProfileType } from '../useProfileType.ts';
import { useBffApi, useBffApiStateStore } from './useBffApi.ts';

export const ONE_SECOND_MS = 1000;

export type SessionData = {
  isAuthenticated: boolean;
  profileType: ProfileType | null;
  authMethod: AuthProfile['authMethod'] | null;
  expiresAtMilliseconds: number; // In milliseconds
};

export function useSessionApi<T extends SessionData = SessionData>(
  url: string
) {
  const sessionApi = useBffApi<T>(url);
  const { data, fetch } = sessionApi;
  const sessionData = data?.content ?? null;
  const { setProfileType } = useProfileType();

  useEffect(() => {
    if (sessionData?.profileType) {
      setProfileType(sessionData.profileType);
    }
  }, [setProfileType, sessionData?.profileType]);

  useEffect(() => {
    let fetchTimeout: ReturnType<typeof setTimeout>;
    const checkAway = () => {
      if (document.body.classList.contains('is-away')) {
        document.body.classList.remove('is-away');
        // Fetching immediately causes Safari IOS to block the request when coming back (focus) from a download dialog.
        // This causes the user to appear logged out, even though the session is still valid.
        // Delaying the fetch with a setTimeout somehow prevents this from happening.
        fetchTimeout = setTimeout(() => {
          fetch();
        }, 10);
      }
    };

    const addAway = () => {
      clearTimeout(fetchTimeout);
      document.body.classList.add('is-away');
    };

    window.addEventListener('focus', checkAway);
    window.addEventListener('blur', addAway);

    return () => {
      clearTimeout(fetchTimeout);
      window.removeEventListener('focus', checkAway);
      window.removeEventListener('blur', addAway);
    };
  }, [fetch]);

  return {
    isLoading: sessionApi.isLoading,
    isDirty: sessionApi.isDirty,
    isAuthenticated: sessionData?.isAuthenticated ?? false,
    expiresAtMilliseconds: sessionData?.expiresAtMilliseconds ?? 0,
  };
}

export function useSessionApiData<T extends SessionData = SessionData>(
  url: string
) {
  const bffApiStateStore = useBffApiStateStore();
  return bffApiStateStore.get<T>(url)?.data?.content ?? null;
}

export function useLogout(url: string) {
  return () => {
    clearSessionStorage();
    clearDeeplinkEntry();
    window.location.href = url;
  };
}

import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil';
import { AuthProfile } from '../../../server/helpers/app';
import { ApiSuccessResponse } from '../../../universal/helpers';
import {
  ApiErrorResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import {
  AUTH_API_URL_DIGID,
  AUTH_API_URL_EHERKENNING,
  LOGOUT_URL,
} from '../../config/api';
import { clearSessionStorage } from '../storage.hook';
import { clearDeeplinkEntry } from '../useDeeplink.hook';
import { useProfileType } from '../useProfileType';
import { useDataApi } from './useDataApi';

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

export function useSessionApi() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requestOptions = {
    url:
      params.get('authMethod') === 'eherkenning'
        ? AUTH_API_URL_EHERKENNING
        : AUTH_API_URL_DIGID,
  };
  const [sessionResponse, refetch] = useDataApi<SessionResponseData>(
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
    window.location.href = LOGOUT_URL;
  }, []);

  useEffect(() => {
    setSession(() => ({
      ...sessionData,
      isLoading,
      isDirty,
      isPristine,
      refetch: () =>
        refetch({
          url:
            sessionData.authMethod === 'eherkenning'
              ? AUTH_API_URL_EHERKENNING
              : AUTH_API_URL_DIGID,
          postpone: false,
        }),
      logout: () => logoutSession(),
    }));
  }, [
    sessionData,
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

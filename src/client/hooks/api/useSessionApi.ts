import { useCallback, useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { ApiSuccessResponse } from '../../../universal/helpers';
import {
  ApiErrorResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AUTH_API_URL, LOGOUT_URL } from '../../config/api';
import { clearSessionStorage } from '../storage.hook';
import { clearDeeplinkEntry } from '../useDeeplink.hook';
import { ApiRequestOptions, useDataApi } from './useDataApi';

export type SessionData = {
  isAuthenticated: boolean;
  validUntil: number;
  validityInSeconds: number;
  profileType: ProfileType;
};

const INITIAL_SESSION_CONTENT: SessionData = {
  isAuthenticated: false,
  validUntil: -1,
  validityInSeconds: -1,
  profileType: 'private',
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
    apiSuccessResult(INITIAL_SESSION_CONTENT)
  );
  const { data, isLoading, isDirty, isPristine } = sessionResponse;
  const sessionData = data?.content;
  const [session, setSession] = useSessionAtom();

  const sessionValidMaxAge = getValidityInSeconds(
    sessionData?.validUntil || INITIAL_SESSION_CONTENT.validUntil
  );

  const logoutSession = useCallback(() => {
    clearSessionStorage();
    clearDeeplinkEntry();
    window.location.href = LOGOUT_URL;
  }, []);

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

import { useEffect } from 'react';

import { create } from 'zustand';

import { useSessionStorage } from './storage.hook.ts';
import type { AuthProfile } from '../../server/auth/auth-types.ts';
import { logger } from '../helpers/logging.ts';

const PROFILE_TYPE_STORAGE_KEY = 'profileType';

let initialProfileType: ProfileType = 'private';

try {
  const value = sessionStorage.getItem(PROFILE_TYPE_STORAGE_KEY);
  const storageValue = value !== null ? JSON.parse(value) : null;

  if (storageValue) {
    initialProfileType = storageValue;
  }
} catch (error) {
  logger.info("Can't use profileType session value");
}

type ProfileTypeStore = {
  profileType: ProfileType;
  setProfileType: (profileType: ProfileType) => void;
};

type AuthMethodTypeStore = {
  authMethod: AuthProfile['authMethod'];
  setAuthMethodType: (authMethod: AuthProfile['authMethod']) => void;
};

export const useProfileTypeStore = create<ProfileTypeStore>((set) => ({
  profileType: initialProfileType,
  setProfileType: (profileType: ProfileType) => set({ profileType }),
}));

export function useProfileType() {
  const store = useProfileTypeStore();
  const { profileType: stateValue, setProfileType: setState } = store;

  const [profileType, setSessionState] = useSessionStorage(
    PROFILE_TYPE_STORAGE_KEY,
    stateValue
  );

  // If we encounter a profileType stored in the SessionStorage, transfer it to the zustand on first load.
  useEffect(() => {
    if (profileType !== stateValue && profileType !== null) {
      setState(profileType);
    }
  }, [profileType, setState, stateValue]);

  useEffect(() => {
    setSessionState(stateValue);
  }, [stateValue, setSessionState]);

  return store;
}

export function useProfileTypeValue(): ProfileType {
  return useProfileTypeStore((state) => state.profileType);
}

const initialAuthType: AuthProfile['authMethod'] = 'digid';

export const useAuthMethodTypeStore = create<AuthMethodTypeStore>((set) => ({
  authMethod: initialAuthType,
  setAuthMethodType: (authMethod: AuthProfile['authMethod']) =>
    set({ authMethod }),
}));

export function useAuthMethod() {
  return useAuthMethodTypeStore();
}

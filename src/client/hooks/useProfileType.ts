import { useEffect } from 'react';

import { create } from 'zustand';

import { logger } from '../helpers/logging.ts';
import { useSessionStorage } from './storage.hook.ts';

const PROFILE_TYPE_STORAGE_KEY = 'profileType';

let initialProfileType: ProfileType = 'private';

try {
  const value = sessionStorage.getItem(PROFILE_TYPE_STORAGE_KEY);
  const storageValue = value !== null ? JSON.parse(value) : null;

  if (storageValue) {
    initialProfileType = storageValue;
  }
} catch (_error) {
  logger.info("Can't use profileType session value");
}

type ProfileTypeStore = {
  profileType: ProfileType;
  setProfileType: (profileType: ProfileType) => void;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run this effect on the first render to sync session storage with zustand.
  useEffect(() => {
    if (profileType !== stateValue && profileType !== null) {
      setState(profileType);
    }
  }, []);

  useEffect(() => {
    setSessionState(stateValue);
  }, [stateValue, setSessionState]);

  return store;
}

export function useProfileTypeValue(): ProfileType {
  return useProfileTypeStore((state) => state.profileType);
}

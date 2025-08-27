import { useEffect } from 'react';

import { create } from 'zustand';

import { useSessionStorage } from './storage.hook';

const PROFILE_TYPE_STORAGE_KEY = 'profileType';

let initialProfileType: ProfileType = 'private';

try {
  const value = sessionStorage.getItem(PROFILE_TYPE_STORAGE_KEY);
  const storageValue = value !== null ? JSON.parse(value) : null;

  if (storageValue) {
    initialProfileType = storageValue;
  }
} catch (error) {
  console.info("Can't use profileType session value");
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

  // If we encounter a profileType stored in the SessionStorage, transfer it to the recoil state on first load.
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

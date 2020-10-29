import { useEffect } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { IS_COMMERCIAL_PATH_MATCH } from '../config/api';
import { useSessionStorage } from './storage.hook';

const PROFILE_TYPE_STORAGE_KEY = 'profileType';

let initialProfileType = IS_COMMERCIAL_PATH_MATCH ? 'commercial' : 'private';

try {
  const value = sessionStorage.getItem(PROFILE_TYPE_STORAGE_KEY);
  const storageValue = value !== null ? JSON.parse(value) : null;
  if (storageValue) {
    initialProfileType = storageValue;
  }
} catch (error) {
  console.info("Can't use profileType session value");
}

export const profileTypeState = atom<ProfileType>({
  key: PROFILE_TYPE_STORAGE_KEY,
  default: initialProfileType as ProfileType,
});

export function useProfileType() {
  const state = useRecoilState<ProfileType>(profileTypeState);
  const [stateValue, setState] = state;
  const [profileType, setSessionState] = useSessionStorage(
    PROFILE_TYPE_STORAGE_KEY,
    stateValue
  );

  // If we encounter a profileType stored in the SessionStorage, transfer it to the recoil state on first load.
  useEffect(() => {
    if (profileType !== stateValue) {
      setState(profileType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSessionState(stateValue);
  }, [stateValue, setSessionState]);

  return state;
}

export function useProfileTypeValue() {
  return useRecoilValue(profileTypeState);
}

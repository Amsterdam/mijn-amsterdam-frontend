import { useEffect } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { IS_COMMERCIAL_PATH_MATCH } from '../config/api';
import { useSessionStorage } from './storage.hook';

let initialProfileType = IS_COMMERCIAL_PATH_MATCH ? 'commercial' : 'private';

try {
  const sessionProfileType = JSON.parse(
    sessionStorage.getItem('profileType') || ''
  );
  if (sessionProfileType) {
    initialProfileType = sessionProfileType;
  }
} catch (error) {
  console.info(
    'Local storage not accessible, using initial profile type',
    initialProfileType
  );
}

export const profileTypeState = atom<ProfileType>({
  key: 'profileType',
  default: initialProfileType as ProfileType,
});

export function useProfileType() {
  const state = useRecoilState<ProfileType>(profileTypeState);
  const [stateValue, setState] = state;
  const [profileType, setSessionState] = useSessionStorage(
    'profileType',
    stateValue
  );

  // If we encounter a profileType stored in the SessionStorage, transfer it to the recoil state on first load.
  useEffect(() => {
    if (profileType) {
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

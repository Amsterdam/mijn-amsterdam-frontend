import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { IS_COMMERCIAL_PATH_MATCH } from '../config/api';
import { useSessionStorage } from './storage.hook';

const initialProfileType = IS_COMMERCIAL_PATH_MATCH ? 'commercial' : 'private';

const profileTypeState = atom<ProfileType>({
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
  return useRecoilState(profileTypeState)[0];
}

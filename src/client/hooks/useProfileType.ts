import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { IS_COMMERCIAL_PATH_MATCH } from '../config/api';
import { useSessionStorage } from './storage.hook';

const profileTypeState = atom<ProfileType>({
  key: 'profileType',
  default: IS_COMMERCIAL_PATH_MATCH ? 'commercial' : 'private',
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
  }, []);

  useEffect(() => {
    setSessionState(stateValue);
  }, [stateValue, setSessionState]);

  return state;
}

import { atom, useRecoilState } from 'recoil';
import { IS_COMMERCIAL_PATH_MATCH } from '../config/api';
import { useEffect, useMemo } from 'react';
import { useSessionStorage } from './storage.hook';

const commercialProfileState = atom({
  key: 'commercialProfile',
  default: IS_COMMERCIAL_PATH_MATCH, // default value (aka initial value)
});

export function useCommercialProfile() {
  const state = useRecoilState(commercialProfileState);
  const [stateValue, setState] = state;
  const [isCommercialProfileSession, setSessionState] = useSessionStorage(
    'isCommercialProfile',
    stateValue
  );

  useEffect(() => {
    setState(isCommercialProfileSession);
  }, []);

  useEffect(() => {
    setSessionState(stateValue);
  }, [stateValue, setSessionState]);

  return state;
}

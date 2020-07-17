import { atom, useRecoilState } from 'recoil';
import { IS_COMMERCIAL_PATH_MATCH } from '../config/api';

const commercialProfileState = atom({
  key: 'commercialProfile',
  default: IS_COMMERCIAL_PATH_MATCH, // default value (aka initial value)
});

export function useCommercialProfile() {
  return useRecoilState(commercialProfileState);
}

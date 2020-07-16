import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

const commercialProfileToggleState = atom({
  key: 'commercialProfileToggle',
  default: false, // default value (aka initial value)
});

export function useCommercialProfileToggle() {
  return useRecoilState(commercialProfileToggleState);
}

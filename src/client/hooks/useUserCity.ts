import { useRecoilValue } from 'recoil';
import { appStateAtom } from './useAppState';

export function useUserCity() {
  const state = useRecoilValue(appStateAtom);

  return state.BRP?.content?.adres?.woonplaatsNaam ?? 'Onbekend';
}

import { useAppStateGetter } from './useAppState';

export function useUserCity() {
  const { BRP } = useAppStateGetter();

  return BRP?.content?.adres?.woonplaatsNaam ?? 'Onbekend';
}

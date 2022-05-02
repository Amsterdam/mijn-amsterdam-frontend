import { useAppStateGetter, useAppStateReady } from './useAppState';

export function useUserCity(): string | 'Onbekend' | undefined {
  const isAppStateReady = useAppStateReady();
  const { BRP } = useAppStateGetter();

  return isAppStateReady
    ? BRP?.content?.adres?.woonplaatsNaam ?? 'Onbekend'
    : undefined;
}

import { useEffect } from 'react';
import { useSessionStorage } from './storage.hook';
import { useThemaMenuItems } from './useThemaMenuItems';
import { useAppStateGetter } from './useAppState';
import { trackEvent } from '../utils/monitoring';

type ThemaTitleAndId = Record<'title' | 'id', string>;

export function useTrackThemas() {
  const appState = useAppStateGetter();
  const [storedThemas, setStoredThemas] = useSessionStorage('themas', null);

  const themasState = useThemaMenuItems();

  useEffect(() => {
    if (!storedThemas && !themasState.isLoading) {
      const themaTitlesAndIds: ThemaTitleAndId[] = themasState.items.map(
        (item) => ({
          title:
            typeof item.title === 'function'
              ? item.title(appState)
              : item.title,
          id: item.id,
        })
      );
      setStoredThemas(themaTitlesAndIds);
      trackEvent('themas-per-sessie', { themas: themaTitlesAndIds });
    }
  }, [storedThemas, themasState, setStoredThemas]);
}

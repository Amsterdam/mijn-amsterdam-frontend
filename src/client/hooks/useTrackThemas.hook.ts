import { useEffect } from 'react';

import { useSessionStorage } from './storage.hook';
import { useAppStateGetter } from './useAppState';
import { useThemaMenuItems } from './useThemaMenuItems';
import { trackEvent } from '../helpers/monitoring';

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

import { useEffect } from 'react';

import { useSessionStorage } from './storage.hook';
import { useThemaMenuItems } from './useThemaMenuItems';
import type { ThemaMenuItemTransformed } from '../config/thema-types';
import { trackEvent } from '../helpers/monitoring';

type ThemaTitleAndId = Pick<ThemaMenuItemTransformed, 'title' | 'id'>;

export function useTrackThemas() {
  const [storedThemas, setStoredThemas] = useSessionStorage('themas', null);

  const themasState = useThemaMenuItems();

  useEffect(() => {
    if (!storedThemas && !themasState.isLoading) {
      const themaTitlesAndIds: ThemaTitleAndId[] = themasState.items.map(
        (item) => ({
          title: item.title,
          id: item.id,
        })
      );
      setStoredThemas(themaTitlesAndIds);
      trackEvent('themas-per-sessie', { themas: themaTitlesAndIds });
    }
  }, [storedThemas, themasState, setStoredThemas]);
}

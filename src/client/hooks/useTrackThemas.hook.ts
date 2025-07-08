import { useEffect } from 'react';

import { useSessionStorage } from './storage.hook.ts';
import { useThemaMenuItems } from './useThemaMenuItems.ts';
import type { ThemaMenuItemTransformed } from '../config/thema-types.ts';
import { trackEvent } from '../helpers/monitoring.ts';

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

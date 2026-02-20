import { useEffect } from 'react';

import { useSessionStorage } from './storage.hook';
import { useActiveThemaMenuItems } from './useThemaMenuItems';
import type { ThemaMenuItemTransformed } from '../config/thema-types';
import { trackEvent } from '../helpers/monitoring';

type ThemaTitleAndId = Pick<ThemaMenuItemTransformed, 'title' | 'id'>;

export function useTrackThemas() {
  const [storedThemas, setStoredThemas] = useSessionStorage<ThemaTitleAndId[]>(
    'themas',
    []
  );

  const themasState = useActiveThemaMenuItems();

  useEffect(() => {
    if (storedThemas.length === 0 && !themasState.isLoading) {
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

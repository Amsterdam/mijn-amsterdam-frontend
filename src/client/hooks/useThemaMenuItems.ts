import { useEffect, useMemo, useRef } from 'react';
import { ApiResponse, isError, isLoading } from '../../universal/helpers/api';
import { themasByProfileType } from '../config/menuItems';
import { ThemaMenuItem } from '../config/thema';
import { getThemaMenuItemsAppState, isThemaActive } from '../config/themas';
import { useAppStateGetter } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { useSessionStorage } from './storage.hook';
import { trackEvent } from '../utils/monitoring';

export interface ThemasState {
  items: ThemaMenuItem[];
  isLoading: boolean;
}

type ThemaTitleAndId = Record<'title' | 'id', string>;

export function useThemaMenuItems(): ThemasState {
  const profileType = useProfileTypeValue();
  const appState = useAppStateGetter();
  const themaItems = themasByProfileType(profileType);

  const items = themaItems.filter((item) => {
    // Check to see if Thema has been loaded or if it is directly available
    return item.isAlwaysVisible || isThemaActive(item, appState);
  });

  const themaItemsWithAppState = getThemaMenuItemsAppState(
    appState,
    themaItems
  );

  const themasState = useMemo(
    () => ({
      items,
      isLoading:
        !!appState &&
        themaItemsWithAppState.some((apiState) => {
          const apiStateTyped = apiState as ApiResponse<any>;
          return isLoading(apiStateTyped) && !isError(apiStateTyped);
        }),
    }),
    [items, appState, themaItemsWithAppState]
  );

  const [storedThemas, setStoredThemas] = useSessionStorage('themas', null);
  const hasTrackedThemas = useRef(storedThemas ? true : false);

  useEffect(() => {
    if (
      (!storedThemas || !hasTrackedThemas.current) &&
      !themasState.isLoading
    ) {
      const themaTitlesAndIds: ThemaTitleAndId[] = items.map((item) => ({
        title:
          typeof item.title === 'function' ? item.title(appState) : item.title,
        id: item.id,
      }));
      setStoredThemas(themaTitlesAndIds);

      trackEvent('themas-per-sessie', { themas: themaTitlesAndIds });
      hasTrackedThemas.current = true;
    }
  }, [storedThemas, themasState, items, setStoredThemas]);

  return themasState;
}

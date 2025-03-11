import { useMemo } from 'react';

import { useAppStateGetter, useAppStateReady } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { Thema } from '../../universal/config/thema';
import { themasByProfileType } from '../config/menuItems';
import { ThemaMenuItemTransformed } from '../config/thema';
import { getThemaMenuItemsAppState, isThemaActive } from '../helpers/themas';

export interface ThemasState {
  items: ThemaMenuItemTransformed[];
  isLoading: boolean;
}

export function useThemaMenuItems(): ThemasState {
  const profileType = useProfileTypeValue();
  const appState = useAppStateGetter();
  const isAppStateReady = useAppStateReady();
  const themaItems = themasByProfileType(profileType);

  const items = useMemo(() => {
    return themaItems.filter((item) => {
      // Check to see if Thema has been loaded or if it is directly available
      return item.isAlwaysVisible || isThemaActive(item, appState);
    });
  }, [themaItems, appState]);

  const themaItemsWithAppState = useMemo(() => {
    return getThemaMenuItemsAppState(appState, themaItems);
  }, [appState, themaItems]);

  const themasState = useMemo(
    () => ({
      items,
      isLoading: !isAppStateReady,
    }),
    [items, appState, themaItemsWithAppState, isAppStateReady]
  );

  return themasState;
}

export function useThemaMenuItemsByThemaID() {
  const { items } = useThemaMenuItems();

  const themaById = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.id] = item;
          return acc;
        },
        {} as Record<Thema, ThemaMenuItemTransformed>
      ),
    [items]
  );

  return themaById;
}

export function useThemaMenuItemByThemaID(themaID: Thema) {
  const itemsById = useThemaMenuItemsByThemaID();
  return itemsById[themaID];
}

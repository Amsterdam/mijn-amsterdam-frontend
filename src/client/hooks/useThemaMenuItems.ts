import { useMemo } from 'react';

import { useAppStateGetter, useAppStateReady } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { themasByProfileType } from '../config/menuItems';
import { ThemaMenuItem } from '../config/thema';
import { getThemaMenuItemsAppState, isThemaActive } from '../helpers/themas';

export interface ThemasState {
  items: ThemaMenuItem[];
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

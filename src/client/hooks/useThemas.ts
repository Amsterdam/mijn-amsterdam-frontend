import { useMemo } from 'react';
import { ThemaMenuItem } from '../../universal/config';
import { ApiResponse, isError, isLoading } from '../../universal/helpers';
import { themasByProfileType } from '../config/menuItems';
import { useAppStateGetter } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import {
  getThemaMenuItemsAppState,
  isThemaActive,
} from '../../universal/helpers/themas';

export interface ThemasState {
  items: ThemaMenuItem[];
  isLoading: boolean;
}

export function useThemaMenuItems() {
  const profileType = useProfileTypeValue();
  return themasByProfileType[profileType] || [];
}

export function useThemas(): ThemasState {
  const appState = useAppStateGetter();
  const themaItems = useThemaMenuItems();

  const items = themaItems.filter((item) => {
    return item.isAlwaysVisible || isThemaActive(item, appState);
  });
  // Check to see if Thema has been loaded or if it is directly available
  //console.log('useThemas ', items);

  const themaItemsWithAppState = getThemaMenuItemsAppState(
    appState,
    themaItems
  );

  return useMemo(
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
}

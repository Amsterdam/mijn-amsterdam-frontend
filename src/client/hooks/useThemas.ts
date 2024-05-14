import { useMemo } from 'react';
import { ChapterMenuItem } from '../../universal/config';
import { ApiResponse, isError, isLoading } from '../../universal/helpers';
import { themasByProfileType } from '../config/menuItems';
import { useAppStateGetter } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import {
  getChapterMenuItemsAppState,
  isChapterActive,
} from '../../universal/helpers/themas';

export interface ChaptersState {
  items: ChapterMenuItem[];
  isLoading: boolean;
}

export function useChapterMenuItems() {
  const profileType = useProfileTypeValue();
  return themasByProfileType[profileType] || [];
}

export function useThemas(): ChaptersState {
  const appState = useAppStateGetter();
  const themaItems = useChapterMenuItems();

  const items = themaItems.filter((item) => {
    // Check to see if Thema has been loaded or if it is directly available
    return item.isAlwaysVisible || isChapterActive(item, appState);
  });

  const themaItemsWithAppState = getChapterMenuItemsAppState(
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

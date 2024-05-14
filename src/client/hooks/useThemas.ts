import { useMemo } from 'react';
import { ChapterMenuItem } from '../../universal/config';
import { ApiResponse, isError, isLoading } from '../../universal/helpers';
import { chaptersByProfileType } from '../config/menuItems';
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
  return chaptersByProfileType[profileType] || [];
}

export function useThemas(): ChaptersState {
  const appState = useAppStateGetter();
  const chapterItems = useChapterMenuItems();

  const items = chapterItems.filter((item) => {
    // Check to see if Thema has been loaded or if it is directly available
    return item.isAlwaysVisible || isChapterActive(item, appState);
  });

  const chapterItemsWithAppState = getChapterMenuItemsAppState(
    appState,
    chapterItems
  );

  return useMemo(
    () => ({
      items,
      isLoading:
        !!appState &&
        chapterItemsWithAppState.some((apiState) => {
          const apiStateTyped = apiState as ApiResponse<any>;
          return isLoading(apiStateTyped) && !isError(apiStateTyped);
        }),
    }),
    [items, appState, chapterItemsWithAppState]
  );
}

import { AppState } from '../AppState';
import { useMemo } from 'react';

import { Chapters, FeatureToggle } from '../../universal/config';
import {
  ApiResponse,
  isError,
  isLoading,
  isMokum,
} from '../../universal/helpers';
import {
  ChapterMenuItem,
  myChaptersMenuItems,
  myChaptersMenuItemsCommercial,
} from '../config/menuItems';
import { useCommercialProfile } from './useCommercialProfile';
import { useAppStateAtom } from './useAppState';

function isChapterActive(
  item: ChapterMenuItem,
  {
    WMO,
    FOCUS_SPECIFICATIES,
    FOCUS_AANVRAGEN,
    FOCUS_TOZO,
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
    VERGUNNINGEN,
    HOME,
    KVK,
  }: AppState
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return (
        !(
          isLoading(FOCUS_AANVRAGEN) &&
          isLoading(FOCUS_SPECIFICATIES) &&
          isLoading(FOCUS_TOZO)
        ) &&
        (!!FOCUS_AANVRAGEN.content?.length ||
          !!FOCUS_TOZO.content?.length ||
          !!FOCUS_SPECIFICATIES.content?.jaaropgaven?.length ||
          !!FOCUS_SPECIFICATIES.content?.uitkeringsspecificaties?.length)
      );

    case Chapters.ZORG:
      return !isLoading(WMO) && !!WMO.content?.length;

    case Chapters.BELASTINGEN:
      // Belastingen always visible if we receive an error from the api
      return (
        !isLoading(BELASTINGEN) &&
        (FeatureToggle.belastingApiActive && BELASTINGEN.status === 'OK'
          ? BELASTINGEN.content?.isKnown
          : true)
      );

    case Chapters.MILIEUZONE:
      return (
        !isLoading(MILIEUZONE) &&
        (FeatureToggle.milieuzoneApiActive
          ? MILIEUZONE.content?.isKnown
          : false)
      );

    case Chapters.AFVAL:
      return (
        FeatureToggle.garbageInformationPage &&
        !isLoading(AFVAL) &&
        !isLoading(HOME) &&
        isMokum(BRP.content)
      );

    case Chapters.ERFPACHT:
      return !isLoading(ERFPACHT) && ERFPACHT.content?.isKnown === true;

    case Chapters.BURGERZAKEN:
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !isLoading(BRP) &&
        !!BRP.content?.identiteitsbewijzen?.length
      );

    case Chapters.BRP:
      return !isLoading(BRP) && !!BRP.content?.persoon;

    case Chapters.VERGUNNINGEN:
      return !isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length;

    case Chapters.KVK:
      return !isLoading(KVK) && !!KVK.content?.name;
  }

  return false;
}

export interface ChaptersState {
  items: ChapterMenuItem[];
  isLoading: boolean;
}

export function useChapters(): ChaptersState {
  const appState = useAppStateAtom();
  const [isCommercialProfile] = useCommercialProfile();
  const chapterItems = isCommercialProfile
    ? myChaptersMenuItemsCommercial
    : myChaptersMenuItems;
  const items = chapterItems.filter(item => {
    // Check to see if Chapter has been loaded or if it is directly available
    return isChapterActive(item, appState);
  });

  // console.log('isCommercialProfile', isCommercialProfile);

  return useMemo(
    () => ({
      items,
      isLoading:
        !!appState &&
        chapterItems
          .map(({ id }) => ({ id, apiState: appState[id as keyof AppState] }))
          .filter(({ id, apiState }) => !!apiState)
          .some(({ id, apiState }) => {
            const apiStateTyped = apiState as ApiResponse<any>;
            const loading = isLoading(apiStateTyped) && !isError(apiStateTyped);
            return loading;
          }),
    }),
    [items, chapterItems, appState]
  );
}

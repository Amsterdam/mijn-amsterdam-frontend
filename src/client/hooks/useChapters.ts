import { useMemo } from 'react';
import { Chapters, FeatureToggle } from '../../universal/config';
import {
  ApiResponse,
  isError,
  isLoading,
  isMokum,
} from '../../universal/helpers';
import { AppState } from '../AppState';
import { ChapterMenuItem, chaptersByProfileType } from '../config/menuItems';
import { useAppStateGetter } from './useAppState';
import { useProfileTypeValue } from './useProfileType';

function isChapterActive(
  item: ChapterMenuItem,
  {
    WMO,
    FOCUS_SPECIFICATIES,
    FOCUS_AANVRAGEN,
    FOCUS_STADSPAS,
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
      const hasStadspasSaldo =
        FeatureToggle.stadpasActive &&
        !!FOCUS_STADSPAS?.content?.stadspassaldo?.stadspassen?.length;
      const isLoadingStadspasSaldo =
        FeatureToggle.stadpasActive && isLoading(FOCUS_STADSPAS);
      return (
        !(
          isLoading(FOCUS_AANVRAGEN) &&
          isLoading(FOCUS_SPECIFICATIES) &&
          isLoadingStadspasSaldo &&
          isLoading(FOCUS_TOZO)
        ) &&
        (!!FOCUS_AANVRAGEN?.content?.length ||
          !!FOCUS_TOZO?.content?.length ||
          hasStadspasSaldo ||
          !!FOCUS_SPECIFICATIES?.content?.jaaropgaven?.length ||
          !!FOCUS_SPECIFICATIES?.content?.uitkeringsspecificaties?.length)
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
      return !isLoading(KVK) && !!KVK.content;
  }

  return false;
}

export interface ChaptersState {
  items: ChapterMenuItem[];
  isLoading: boolean;
}

export function useChapterMenuItems() {
  const profileType = useProfileTypeValue();
  return chaptersByProfileType[profileType] || [];
}

export function useChapters(): ChaptersState {
  const appState = useAppStateGetter();
  const chapterItems = useChapterMenuItems();

  const items = chapterItems.filter(item => {
    // Check to see if Chapter has been loaded or if it is directly available
    return item.isAlwaysVisible || isChapterActive(item, appState);
  });

  return useMemo(
    () => ({
      items,
      isLoading:
        !!appState &&
        chapterItems
          .filter(({ isAlwaysVisible }) => !isAlwaysVisible)
          .map(({ id }) => appState[id as keyof AppState])
          .filter(apiState => !!apiState)
          .some(apiState => {
            const apiStateTyped = apiState as ApiResponse<any>;
            return isLoading(apiStateTyped) && !isError(apiStateTyped);
          }),
    }),
    [items, chapterItems, appState]
  );
}

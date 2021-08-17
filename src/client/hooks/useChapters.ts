import { useMemo } from 'react';
import { ToeristischeVerhuurVergunning } from '../../server/services/toeristische-verhuur';
import { Chapters, ChapterTitles, FeatureToggle } from '../../universal/config';
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

export function getToeristischeVerhuurTitle(
  vergunningen?: ToeristischeVerhuurVergunning[]
): string {
  const hasVergunningenVakantieVerhuur = vergunningen?.some(
    (vergunning) => vergunning.title === 'Vergunning vakantieverhuur'
  );
  const hasVergunningBB = vergunningen?.some(
    (vergunning) => vergunning.title === 'Vergunning bed & breakfast'
  );
  switch (true) {
    case hasVergunningenVakantieVerhuur:
      return 'Vakantieverhuur';
    case hasVergunningBB && !hasVergunningenVakantieVerhuur:
      return 'Bed & Breakfast';
    default:
      return 'Vakantieverhuur';
  }
}

function chapterTitle(
  item: ChapterMenuItem,
  { TOERISTISCHE_VERHUUR }: AppState
) {
  if (item.id === Chapters.TOERISTISCHE_VERHUUR) {
    return getToeristischeVerhuurTitle(
      TOERISTISCHE_VERHUUR.content?.vergunningen
    );
  }
  return item.title;
}

function isChapterActive(
  item: ChapterMenuItem,
  {
    WMO,
    FOCUS_SPECIFICATIES,
    FOCUS_AANVRAGEN,
    FOCUS_STADSPAS,
    FOCUS_TOZO,
    FOCUS_TONK,
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
    VERGUNNINGEN,
    TOERISTISCHE_VERHUUR,
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
          isLoading(FOCUS_TOZO) &&
          isLoading(FOCUS_TONK)
        ) &&
        (!!FOCUS_AANVRAGEN?.content?.length ||
          !!FOCUS_TOZO?.content?.length ||
          !!FOCUS_TONK?.content?.length ||
          !!FOCUS_SPECIFICATIES?.content?.jaaropgaven?.length ||
          !!FOCUS_SPECIFICATIES?.content?.uitkeringsspecificaties?.length)
      );

    case Chapters.STADSPAS:
      const hasStadspasSaldo = !!FOCUS_STADSPAS?.content?.stadspassen?.length;
      const hasStadspasAanvragen = !!FOCUS_AANVRAGEN?.content?.filter(
        (aanvraag) => aanvraag.productTitle === 'Stadspas'
      )?.length;
      const isLoadingStadspas =
        isLoading(FOCUS_STADSPAS) || isLoading(FOCUS_AANVRAGEN);
      return !isLoadingStadspas && (hasStadspasSaldo || hasStadspasAanvragen);

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
        (isMokum(BRP.content) || isMokum(KVK.content))
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

    case Chapters.TOERISTISCHE_VERHUUR:
      return (
        !isLoading(TOERISTISCHE_VERHUUR) &&
        (!!TOERISTISCHE_VERHUUR.content?.registraties?.length ||
          !!TOERISTISCHE_VERHUUR.content?.vergunningen?.length)
      );
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
  const items = chapterItems
    .filter((item) => {
      // Check to see if Chapter has been loaded or if it is directly available
      return item.isAlwaysVisible || isChapterActive(item, appState);
    })
    .map((chapterItem) => {
      return Object.assign(chapterItem, {
        title: chapterTitle(chapterItem, appState),
      });
    });
  return useMemo(
    () => ({
      items,
      isLoading:
        !!appState &&
        chapterItems
          .filter(({ isAlwaysVisible }) => !isAlwaysVisible)
          .map(({ id }) => appState[id as keyof AppState])
          .filter((apiState) => !!apiState)
          .some((apiState) => {
            const apiStateTyped = apiState as ApiResponse<any>;
            return isLoading(apiStateTyped) && !isError(apiStateTyped);
          }),
    }),
    [items, chapterItems, appState]
  );
}

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
    FINANCIELE_HULP,
  }: AppState
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      const { jaaropgaven, uitkeringsspecificaties } =
        FOCUS_SPECIFICATIES?.content ?? {};
      const hasAanvragen = FOCUS_AANVRAGEN?.content?.length;
      const hasTozo = !!FOCUS_TOZO?.content?.length;
      const hasTonk = !!FOCUS_TONK?.content?.length;
      const hasJaaropgaven = !!jaaropgaven?.length;
      const hasUitkeringsspecificaties = !!uitkeringsspecificaties?.length;
      return (
        !(
          isLoading(FOCUS_AANVRAGEN) &&
          isLoading(FOCUS_SPECIFICATIES) &&
          isLoading(FOCUS_TOZO) &&
          isLoading(FOCUS_TONK)
        ) &&
        (hasAanvragen ||
          hasTozo ||
          hasTonk ||
          hasJaaropgaven ||
          hasUitkeringsspecificaties)
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
      const belastingenActive =
        FeatureToggle.belastingApiActive && BELASTINGEN.status === 'OK'
          ? BELASTINGEN.content?.isKnown
          : true;
      return !isLoading(BELASTINGEN) && belastingenActive;

    case Chapters.MILIEUZONE:
      return (
        !isLoading(MILIEUZONE) &&
        (FeatureToggle.milieuzoneApiActive
          ? MILIEUZONE.content?.isKnown
          : false)
      );

    case Chapters.AFVAL:
      const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);
      return (
        FeatureToggle.garbageInformationPage &&
        !isLoading(AFVAL) &&
        !isLoading(HOME) &&
        isAmsterdam
      );

    case Chapters.ERFPACHT:
      return !isLoading(ERFPACHT) && ERFPACHT.content?.isKnown === true;

    case Chapters.BURGERZAKEN:
      const hasIdentiteitsbewijs =
        !!BRP?.content?.identiteitsbewijzen?.length ?? {};
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !isLoading(BRP) &&
        hasIdentiteitsbewijs
      );

    case Chapters.BRP:
      return !isLoading(BRP) && !!BRP.content?.persoon;

    case Chapters.VERGUNNINGEN:
      return !isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length;

    case Chapters.KVK:
      return !isLoading(KVK) && !!KVK.content;

    case Chapters.TOERISTISCHE_VERHUUR:
      const { registraties, vergunningen } =
        TOERISTISCHE_VERHUUR?.content ?? {};
      const hasRegistraties = !!registraties?.length;
      const hasVergunningen = !!vergunningen?.length;
      return (
        !isLoading(TOERISTISCHE_VERHUUR) && (hasRegistraties || hasVergunningen)
      );
    case Chapters.FINANCIELE_HULP:
      const { deepLinks } = FINANCIELE_HULP?.content ?? {};

      return !isLoading(FINANCIELE_HULP) && !!deepLinks;
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

  const items = chapterItems.filter((item) => {
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
          .filter((apiState) => !!apiState)
          .some((apiState) => {
            const apiStateTyped = apiState as ApiResponse<any>;
            return isLoading(apiStateTyped) && !isError(apiStateTyped);
          }),
    }),
    [items, chapterItems, appState]
  );
}

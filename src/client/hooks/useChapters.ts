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

export function isChapterActive(
  item: ChapterMenuItem,
  {
    WMO,
    WPI_SPECIFICATIES,
    WPI_AANVRAGEN,
    WPI_STADSPAS,
    WPI_TOZO,
    WPI_TONK,
    WPI_BBZ,
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
    VERGUNNINGEN,
    TOERISTISCHE_VERHUUR,
    SUBSIDIE,
    MY_LOCATION,
    KVK,
    KREFIA,
    KLACHTEN,
    BEZWAREN,
  }: AppState
) {
  const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);

  switch (item.id) {
    case Chapters.INKOMEN:
      const { jaaropgaven, uitkeringsspecificaties } =
        WPI_SPECIFICATIES?.content ?? {};
      const hasAanvragen = WPI_AANVRAGEN?.content?.length;
      const hasTozo = !!WPI_TOZO?.content?.length;
      const hasTonk = !!WPI_TONK?.content?.length;
      const hasBbz = !!WPI_BBZ?.content?.length;
      const hasJaaropgaven = !!jaaropgaven?.length;
      const hasUitkeringsspecificaties = !!uitkeringsspecificaties?.length;
      return (
        !(
          isLoading(WPI_AANVRAGEN) &&
          isLoading(WPI_SPECIFICATIES) &&
          isLoading(WPI_TOZO) &&
          isLoading(WPI_TONK) &&
          isLoading(WPI_BBZ)
        ) &&
        (hasAanvragen ||
          hasTozo ||
          hasTonk ||
          hasJaaropgaven ||
          hasBbz ||
          hasUitkeringsspecificaties)
      );

    case Chapters.STADSPAS:
      const hasStadspas =
        !!WPI_STADSPAS?.content?.stadspassen?.length ||
        !!WPI_STADSPAS?.content?.aanvragen?.length;
      const isLoadingStadspas = isLoading(WPI_STADSPAS);
      return !isLoadingStadspas && hasStadspas;

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
      return (
        FeatureToggle.garbageInformationPage &&
        !isLoading(AFVAL) &&
        !isLoading(MY_LOCATION) &&
        isAmsterdam
      );

    case Chapters.ERFPACHT:
      return !isLoading(ERFPACHT) && ERFPACHT.content?.isKnown === true;

    case Chapters.SUBSIDIE:
      return !isLoading(SUBSIDIE) && SUBSIDIE.content?.isKnown === true;

    case Chapters.BURGERZAKEN:
      const hasIdentiteitsbewijs = !!BRP?.content?.identiteitsbewijzen?.length;
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

    case Chapters.KREFIA:
      return !isLoading(KREFIA) && !!KREFIA.content?.deepLinks;

    case Chapters.PARKEREN:
      return isAmsterdam && FeatureToggle.parkerenActive;

    case Chapters.KLACHTEN:
      return (
        !isLoading(KLACHTEN) &&
        !!KLACHTEN?.content?.klachten.length &&
        FeatureToggle.klachtenActive
      );

    case Chapters.BEZWAREN:
      return (
        !isLoading(BEZWAREN) &&
        !!BEZWAREN?.content?.length &&
        FeatureToggle.bezwarenActive
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

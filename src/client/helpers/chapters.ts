import { MenuItem, myChaptersMenuItems } from '../config/menuItems';

import { AppState } from '../AppState';
import { Chapters } from '../../universal/config/chapter';
import { FeatureToggle } from '../../universal/config/app';
import { isLoading, isError, isMokum } from '../../universal/helpers';

function isChapterActive(
  item: MenuItem,
  {
    WMO,
    FOCUS_SPECIFICATIES,
    FOCUS_AANVRAGEN,
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
  }: AppState
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return (
        !(isLoading(FOCUS_AANVRAGEN) && isLoading(FOCUS_SPECIFICATIES)) &&
        !(isError(FOCUS_AANVRAGEN) && isError(FOCUS_SPECIFICATIES))
      );

    case Chapters.ZORG:
      return !isLoading(WMO) && !!WMO.content?.items.length;

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
        isMokum(BRP.content)
      );

    case Chapters.WONEN:
      return !isLoading(ERFPACHT) && ERFPACHT.content?.status === true;

    case Chapters.BURGERZAKEN:
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !BRP.isLoading &&
        !!BRP.data.identiteitsbewijzen
      );

    case Chapters.BRP:
      return !isLoading(BRP) && !!BRP.content?.persoon;
  }

  return false;
}

export interface ChaptersState {
  items: MenuItem[];
  isLoading: boolean;
}

export function getMyChapters(appState: AppState): ChaptersState {
  const {
    WMO,
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
  } = appState;

  const wmoIsloading = isLoading(WMO);
  const focusAanvragenIsloading = isLoading(FOCUS_AANVRAGEN);
  const focusSpecificatiesIsloading = isLoading(FOCUS_SPECIFICATIES);
  const erfpachtIsloading = isLoading(ERFPACHT);
  const brpIsLoading = isLoading(BRP);
  const garbageIsLoading = isLoading(AFVAL);
  const belastingIsLoading = isLoading(BELASTINGEN);
  const milieuzoneIsLoading = isLoading(MILIEUZONE);

  const items = myChaptersMenuItems.filter(item => {
    // Check to see if Chapter has been loaded or if it is directly available
    return isChapterActive(item, appState);
  });

  const isChaptersLoading =
    belastingIsLoading ||
    milieuzoneIsLoading ||
    wmoIsloading ||
    brpIsLoading ||
    focusSpecificatiesIsloading ||
    focusAanvragenIsloading ||
    erfpachtIsloading ||
    garbageIsLoading;

  return {
    items,
    isLoading: isChaptersLoading,
  };
}

import { MenuItem, myChaptersMenuItems } from '../../client/config/menuItems';

import { AppState } from '../../client/AppState';
import { Chapters } from '../config/chapter';
import { FeatureToggle } from '../config/app';
import { isLoading } from './index';
import { isMokum } from '../../client/pages/Profile/formatData';

function isChapterActive(
  item: MenuItem,
  { WMO, FOCUS, ERFPACHT, AFVAL, BRP, BELASTINGEN, MILIEUZONE }: AppState
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return !isLoading(FOCUS);

    case Chapters.ZORG:
      return !isLoading(WMO) && !!WMO.content?.items.length;

    case Chapters.BELASTINGEN:
      return (
        !isLoading(BELASTINGEN) &&
        (FeatureToggle.belastingApiActive ? BELASTINGEN.content?.isKnown : true)
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

    case Chapters.MIJN_GEGEVENS:
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
    FOCUS,
    FOCUS_TOZO,
    FOCUS_SPECIFICATIONS,
    ERFPACHT,
    AFVAL,
    BRP,
    BUURT,
    BELASTINGEN,
    MILIEUZONE,
  } = appState;

  const wmoIsloading = WMO.isLoading;
  const focusIsloading = FOCUS.isLoading;
  const focusTozoIsloading = FOCUS_TOZO.isLoading;
  const focusSpecsIsloading = FOCUS_SPECIFICATIONS.isLoading;
  const erfpachtIsloading = ERFPACHT.isLoading;
  const isFromMokum = isMokum(BRP);
  const brpIsLoading = BRP.isLoading;
  const garbageIsPristine = GARBAGE.isPristine;
  const myAreaIsLoading = MIJN_BUURT.isLoading;
  const belastingIsLoading = BELASTINGEN.isLoading;
  const MILIEUZONEIsLoading = MILIEUZONE.isLoading;
  const hasCentroid = !!MIJN_BUURT.data?.centroid;

  const items = myChaptersMenuItems.filter(item => {
    // Check to see if Chapter has been loaded or if it is directly available
    return isChapterActive(item, appState);
  });

  const isChaptersLoading =
    belastingIsLoading ||
    MILIEUZONEIsLoading ||
    wmoIsloading ||
    brpIsLoading ||
    focusIsloading ||
    myAreaIsLoading ||
    erfpachtIsloading ||
    garbageIsLoading;

  return {
    items,
    isLoading: isChaptersLoading,
  };
}

import { MenuItem, myChaptersMenuItems } from './menuItems';

import { AppState as AppStateInterface } from '../AppState';
import { Chapters } from '../../universal/config/chapter';
import { FeatureToggle } from '../../universal/config/app';
import { isLoading } from '../../universal/helpers';
import { isMokum } from '../pages/Profile/formatData';

function isChapterActive(
  item: MenuItem,
  {
    WMO,
    FOCUS,
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
  }: AppStateInterface
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return !isLoading(FOCUS);

    case Chapters.ZORG:
      return !isLoading(WMO) && !!WMO?.items.length;

    case Chapters.BELASTINGEN:
      return (
        !isLoading(BELASTINGEN) &&
        (FeatureToggle.belastingApiActive ? BELASTINGEN?.isKnown : true)
      );

    case Chapters.MILIEUZONE:
      return (
        !isLoading(MILIEUZONE) &&
        (FeatureToggle.milieuzoneApiActive ? MILIEUZONE?.isKnown : false)
      );

    case Chapters.AFVAL:
      return (
        FeatureToggle.garbageInformationPage &&
        !isLoading(AFVAL) &&
        isMokum(BRP)
      );

    case Chapters.WONEN:
      return !isLoading(ERFPACHT) && ERFPACHT?.status === true;

    case Chapters.BURGERZAKEN:
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !BRP.isLoading &&
        !!BRP.data.identiteitsbewijzen
      );

    case Chapters.MIJN_GEGEVENS:
      return !isLoading(BRP) && !!BRP?.persoon;
  }

  return false;
}

export interface ChaptersState {
  items: MenuItem[];
  isLoading: boolean;
}

export function getMyChapters(apiStates: AppStateInterface): ChaptersState {
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
  } = apiStates;

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
    return isChapterActive(item, apiStates);
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

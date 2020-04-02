import { Chapters, myChaptersMenuItems } from '../config/Chapter.constants';

import { AppState as AppStateInterface } from '../AppState';
import { FeatureToggle } from '../config/App.constants';
import { MenuItem } from '../components/MainNavBar/MainNavBar.constants';
import { isMokum } from '../data-formatting/brp';

function isChapterActive(
  item: MenuItem,
  {
    WMO,
    FOCUS,
    FOCUS_TOZO,
    FOCUS_SPECIFICATIONS,
    ERFPACHT,
    GARBAGE,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
  }: AppStateInterface
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return (
        (!FOCUS.isLoading && !!FOCUS.data.items.length) ||
        (!FOCUS_TOZO.isLoading && !!FOCUS_TOZO.data?.length) ||
        (!FOCUS_SPECIFICATIONS.isLoading &&
          !!(
            FOCUS_SPECIFICATIONS.data?.jaaropgaven.length ||
            FOCUS_SPECIFICATIONS.data?.uitkeringsspecificaties.length
          ))
      );

    case Chapters.ZORG:
      return !WMO.isLoading && !!WMO.data.length;

    case Chapters.BELASTINGEN:
      return (
        !BELASTINGEN.isLoading &&
        (FeatureToggle.belastingApiActive && !BELASTINGEN.isError
          ? BELASTINGEN.data.isKnown
          : true)
      );

    case Chapters.MILIEUZONE:
      return (
        !MILIEUZONE.isLoading &&
        (FeatureToggle.milieuzoneApiActive ? MILIEUZONE.data.isKnown : false)
      );

    case Chapters.AFVAL:
      return (
        FeatureToggle.garbageInformationPage &&
        !GARBAGE.isLoading &&
        GARBAGE.isDirty &&
        !!BRP.data?.persoon.mokum
      );

    case Chapters.WONEN:
      return !ERFPACHT.isLoading && ERFPACHT.data.status === true;

    case Chapters.BURGERZAKEN:
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !BRP.isLoading &&
        !!BRP.data.identiteitsbewijzen?.length
      );

    case Chapters.MIJN_GEGEVENS:
      return !BRP.isLoading && !!BRP.data?.persoon;
  }

  return false;
}

export interface MyChaptersApiState {
  items: MenuItem[];
  isLoading: boolean;
}

export default function getMyChapters(
  apiStates: AppStateInterface
): MyChaptersApiState {
  const {
    WMO,
    FOCUS,
    FOCUS_TOZO,
    FOCUS_SPECIFICATIONS,
    ERFPACHT,
    GARBAGE,
    BRP,
    MIJN_BUURT,
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

  const isLoading =
    belastingIsLoading ||
    MILIEUZONEIsLoading ||
    wmoIsloading ||
    brpIsLoading ||
    focusIsloading ||
    focusTozoIsloading ||
    focusSpecsIsloading ||
    myAreaIsLoading ||
    erfpachtIsloading ||
    (garbageIsPristine && isFromMokum && hasCentroid);

  return {
    items,
    isLoading,
  };
}

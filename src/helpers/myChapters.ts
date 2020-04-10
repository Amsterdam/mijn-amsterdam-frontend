import { AppState as AppStateInterface } from 'AppState';
import { MenuItem } from 'components/MainNavBar/MainNavBar.constants';
import { FeatureToggle } from 'config/App.constants';
import { Chapters, myChaptersMenuItems } from 'config/Chapter.constants';
import { isMokum } from 'data-formatting/brp';

function isChapterActive(
  item: MenuItem,
  {
    WMO,
    FOCUS,
    ERFPACHT,
    GARBAGE,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
  }: AppStateInterface
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return !FOCUS.isLoading && !!FOCUS.data.items.length;

    case Chapters.ZORG:
      return !WMO.isLoading && !!WMO.data.length;

    case Chapters.BELASTINGEN:
      return (
        !BELASTINGEN.isLoading &&
        (FeatureToggle.belastingApiActive ? BELASTINGEN.data.isKnown : true)
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
      return !BRP.isLoading && !!BRP.data.reisDocumenten;

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
    ERFPACHT,
    GARBAGE,
    BRP,
    MIJN_BUURT,
    BELASTINGEN,
    MILIEUZONE,
  } = apiStates;

  const wmoIsloading = WMO.isLoading;
  const focusIsloading = FOCUS.isLoading;
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
    myAreaIsLoading ||
    erfpachtIsloading ||
    (garbageIsPristine && isFromMokum && hasCentroid);

  return {
    items,
    isLoading,
  };
}

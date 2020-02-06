import { AppState as AppStateInterface } from 'AppState';
import {
  MenuItem,
  myChaptersMenuItems,
} from 'components/MainNavBar/MainNavBar.constants';
import { FeatureToggle } from 'config/App.constants';
import { Chapters } from 'config/Chapter.constants';
import { isMokum } from 'data-formatting/brp';

function isChapterActive(
  item: MenuItem,
  { WMO, FOCUS, ERFPACHT, GARBAGE, BRP, BELASTINGEN }: AppStateInterface
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return (
        !FOCUS.isLoading &&
        !!Object.values(FOCUS.data.products).some(
          product => !!product.items.length
        )
      );

    case Chapters.ZORG:
      return !WMO.isLoading && !!WMO.data.length;

    case Chapters.BELASTINGEN:
      return (
        !BELASTINGEN.isLoading &&
        (FeatureToggle.belastingApiActive ? BELASTINGEN.data.isKnown : true)
      );

    case Chapters.AFVAL:
      return (
        FeatureToggle.garbageInformationPage &&
        !GARBAGE.isLoading &&
        GARBAGE.isDirty &&
        BRP.data &&
        BRP.data.persoon &&
        BRP.data.persoon.mokum
      );

    case Chapters.WONEN:
      return !ERFPACHT.isLoading && ERFPACHT.data.status === true;
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
  } = apiStates;

  const wmoIsloading = WMO.isLoading;
  const focusIsloading = FOCUS.isLoading;
  const erfpachtIsloading = ERFPACHT.isLoading;
  const isFromMokum = isMokum(BRP);
  const brpIsLoading = BRP.isLoading;
  const garbageIsPristine = GARBAGE.isPristine;
  const myAreaIsLoading = MIJN_BUURT.isLoading;
  const belastingIsLoading = BELASTINGEN.isLoading;
  const hasCentroid = !!MIJN_BUURT.data?.centroid;

  const items = myChaptersMenuItems.filter(item => {
    // Check to see if Chapter has been loaded or if it is directly available
    return isChapterActive(item, apiStates);
  });

  const isLoading =
    belastingIsLoading ||
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

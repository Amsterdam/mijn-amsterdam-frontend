import {
  MenuItem,
  myChaptersMenuItems,
} from 'components/MainNavBar/MainNavBar.constants';
import { Chapters, FeatureToggle } from 'config/App.constants';
import { isMokum } from 'data-formatting/brp';
import { BrpApiState } from '../hooks/api/api.brp';
import { ErfpachtApiState } from '../hooks/api/api.erfpacht';
import { FocusApiState } from '../hooks/api/api.focus';
import { GarbageApiState } from '../hooks/api/api.garbage';
import { MyMapApiState } from '../hooks/api/api.mymap';
import { WmoApiState } from '../hooks/api/api.wmo';

interface getMyChaptersProps {
  WMO: WmoApiState;
  FOCUS: FocusApiState;
  ERFPACHT: ErfpachtApiState;
  GARBAGE: GarbageApiState;
  BRP: BrpApiState;
  MIJN_BUURT: MyMapApiState;
}

function isChapterActive(
  item: MenuItem,
  { WMO, FOCUS, ERFPACHT, GARBAGE, BRP }: getMyChaptersProps
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
      return !WMO.isLoading && !!WMO.data.items.length;

    case Chapters.BELASTINGEN:
      return true; // SSO to belastingen, always visible for now.

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
  apiStates: getMyChaptersProps
): MyChaptersApiState {
  const { WMO, FOCUS, ERFPACHT, GARBAGE, BRP, MIJN_BUURT } = apiStates;

  const wmoIsloading = WMO.isLoading;
  const focusIsloading = FOCUS.isLoading;
  const erfpachtIsloading = ERFPACHT.isLoading;
  const isFromMokum = isMokum(BRP);
  const brpIsLoading = BRP.isLoading;
  const garbageIsPristine = GARBAGE.isPristine;
  const myAreaIsLoading = MIJN_BUURT.isLoading;
  const hasCentroid = !!MIJN_BUURT.centroid;

  const items = myChaptersMenuItems.filter(item => {
    // Check to see if Chapter has been loaded or if it is directly available
    return isChapterActive(item, apiStates);
  });

  const isLoading =
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

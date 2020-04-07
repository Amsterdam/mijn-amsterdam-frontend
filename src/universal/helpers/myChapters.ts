import { MenuItem, myChaptersMenuItems } from '../../client/config/menuItems';

import { AppState as AppStateInterface } from '../../client/AppState';
import { Chapters } from '../config/chapter';
import { FeatureToggle } from '../config/app';
import { isLoading } from '.';
import { isMokum } from '../../client/pages/Profile/formatData';

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

    case Chapters.MIJN_GEGEVENS:
      return !isLoading(BRP) && !!BRP?.persoon;
  }

  return false;
}

export interface ChaptersState {
  items: MenuItem[];
  isLoading: boolean;
}

export function getMyChapters(appState: AppStateInterface): ChaptersState {
  const {
    WMO,
    FOCUS,
    ERFPACHT,
    AFVAL,
    BRP,
    BUURT,
    BELASTINGEN,
    MILIEUZONE,
  } = appState;

  const wmoIsloading = isLoading(WMO);
  const focusIsloading = isLoading(FOCUS);
  const erfpachtIsloading = isLoading(ERFPACHT);
  const brpIsLoading = isLoading(BRP);
  const garbageIsLoading = isLoading(AFVAL);
  const myAreaIsLoading = isLoading(BUURT);
  const belastingIsLoading = isLoading(BELASTINGEN);
  const MILIEUZONEIsLoading = isLoading(MILIEUZONE);

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

import { MenuItem, myChaptersMenuItems } from '../../client/config/menuItems';

import { AppState } from '../../client/AppState';
import { Chapters } from '../config/chapter';
import { FeatureToggle } from '../config/app';
import { isLoading } from './index';
import { isMokum } from '../../client/pages/Profile/formatData';
import { isError } from './api';

function isChapterActive(
  item: MenuItem,
  { WMO, FOCUS, ERFPACHT, AFVAL, BRP, BELASTINGEN, MILIEUZONE }: AppState
) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return (
        !isLoading(FOCUS) &&
        !(isError(FOCUS, 'AANVRAGEN') && isError(FOCUS, 'SPECIFICATIES'))
      );

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
    ERFPACHT,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
  } = appState;

  const wmoIsloading = isLoading(WMO);
  const focusIsloading = isLoading(FOCUS);
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
    focusIsloading ||
    erfpachtIsloading ||
    garbageIsLoading;

  return {
    items,
    isLoading: isChaptersLoading,
  };
}

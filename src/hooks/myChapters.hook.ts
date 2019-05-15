import { useCallback } from 'react';
import { myChaptersMenuItems } from 'components/MainNavBar/MainNavBar.constants';
import { WmoApiState } from './api/api.wmo';
import { FocusApiState } from './api/api.focus';
import { Chapters } from 'App.constants';
import { MenuItem } from '../components/MainNavBar/MainNavBar.constants';
import { ErfpachtApiState } from './api/api.erfpacht';
import { ProductTitles } from '../data-formatting/focus';

function isChapterActive(
  item: MenuItem,
  { WMO, FOCUS, ERFPACHT }: useMyChaptersProps
) {
  console.log('>>>', FOCUS.data.products);
  switch (item.id) {
    case Chapters.INKOMEN:
      return (
        !FOCUS.isLoading &&
        (!!FOCUS.data.products[ProductTitles.Bijstandsuitkering] &&
          !!FOCUS.data.products[ProductTitles.Bijstandsuitkering].items.length)
      );

    case Chapters.BURGERZAKEN:
      return (
        !FOCUS.isLoading &&
        !!FOCUS.data.products[ProductTitles.Stadspas] &&
        !!FOCUS.data.products[ProductTitles.Stadspas].items.length
      );

    case Chapters.ZORG:
      return !WMO.isLoading && !!WMO.data.items.length;

    case Chapters.WONEN:
      return !ERFPACHT.isLoading && ERFPACHT.data.status === true;
  }

  return false;
}

interface useMyChaptersProps {
  WMO: WmoApiState;
  FOCUS: FocusApiState;
  ERFPACHT: ErfpachtApiState;
}

export default function useMyChapters(apiStates: useMyChaptersProps) {
  const { WMO, FOCUS, ERFPACHT } = apiStates;
  const availableChapters = useCallback(() => {
    const items = myChaptersMenuItems.filter(item => {
      return isChapterActive(item, apiStates);
    });

    return items;
  }, [WMO.isLoading, FOCUS.isLoading, ERFPACHT.isLoading]);

  return availableChapters();
}

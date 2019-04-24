import { useCallback } from 'react';
import { myChaptersMenuItems } from 'components/MainNavBar/MainNavBar.constants';
import { WmoApiState } from './api/api.wmo';
import { FocusApiState } from './api/api.focus';
import { Chapters } from 'App.constants';
import { MenuItem } from '../components/MainNavBar/MainNavBar.constants';

function isChapterActive(item: MenuItem, { WMO, FOCUS }: useMyChaptersProps) {
  switch (item.id) {
    case Chapters.INKOMEN:
      return !FOCUS.isLoading && !!FOCUS.data.items.length;

    case Chapters.ZORG:
      return !WMO.isLoading && !!WMO.data.items.length;
  }

  return false;
}

interface useMyChaptersProps {
  WMO: WmoApiState;
  FOCUS: FocusApiState;
}

export default function useMyChapters({ WMO, FOCUS }: useMyChaptersProps) {
  const availableChapters = useCallback(() => {
    const items = myChaptersMenuItems.filter(item => {
      return isChapterActive(item, { WMO, FOCUS });
    });

    return items;
  }, [WMO.isLoading, FOCUS.isLoading]);

  return availableChapters();
}

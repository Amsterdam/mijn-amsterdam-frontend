import { Chapters } from 'App.constants';
import {
  MenuItem,
  myChaptersMenuItems,
} from 'components/MainNavBar/MainNavBar.constants';
import { useCallback } from 'react';
import { Chapter } from '../../App.constants';
import { useLocalStorage } from '../storage.hook';
import { ErfpachtApiState } from './api.erfpacht';
import { FocusApiState } from './api.focus';
import { WmoApiState } from './api.wmo';

function isChapterActive(
  item: MenuItem,
  { WMO, FOCUS, ERFPACHT }: useMyChaptersProps
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
      return true; // SSO to belastingen

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

export interface MyChaptersApiState {
  items: MenuItem[];
  isLoading: boolean;
}

export function useLastVisitedChapter() {
  return useLocalStorage<Chapter>('lastChapterVisited');
}

export default function useMyChapters(
  apiStates: useMyChaptersProps
): MyChaptersApiState {
  const { WMO, FOCUS, ERFPACHT } = apiStates;

  const availableChapters = useCallback(() => {
    const items = myChaptersMenuItems.filter(item => {
      return isChapterActive(item, apiStates);
    });

    const isLoading = !!(
      WMO.isLoading ||
      FOCUS.isLoading ||
      ERFPACHT.isLoading
    );

    return {
      items,
      isLoading,
    };
  }, [WMO.isLoading, FOCUS.isLoading, ERFPACHT.isLoading]);

  return availableChapters();
}

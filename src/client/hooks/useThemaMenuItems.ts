import { useEffect, useMemo } from 'react';

import { useLocation } from 'react-router';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import { useAppStateGetter, useAppStateReady } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { sortAlpha } from '../../universal/helpers/utils';
import { LinkProps } from '../../universal/types/App.types';
import { themasByProfileType } from '../config/menuItems';
import { ThemaMenuItemTransformed } from '../config/thema-types';
import {
  themaIdBRP,
  themaIdKVK,
} from '../pages/Thema/Profile/Profile-thema-config';

type ThemaMenuItemTransformedWithHasData<ID extends string = string> =
  ThemaMenuItemTransformed<ID> & {
    hasData: boolean;
  };
export interface ThemasState {
  items: ThemaMenuItemTransformedWithHasData[];
  isLoading: boolean;
}

type withIDTitle = { id: string; title: string };
const sortAlphaOnTitle = sortAlpha('title');

export function compareThemas<T extends withIDTitle>(a: T, b: T): 0 | 1 | -1 {
  // These will be placed on top in the order they are put here.
  const themaIDsOnTop = [themaIdBRP, themaIdKVK] as string[];

  const aHasPrecedence = themaIDsOnTop.includes(a.id);
  const bHasPrecedence = themaIDsOnTop.includes(b.id);

  if (aHasPrecedence && bHasPrecedence) {
    const ia = themaIDsOnTop.indexOf(a.id);
    const ib = themaIDsOnTop.indexOf(b.id);
    return ia < ib ? -1 : 1;
  }
  if (aHasPrecedence) {
    return -1;
  }
  if (bHasPrecedence) {
    return 1;
  }
  return sortAlphaOnTitle(a, b);
}

export function useAllThemaMenuItems(): ThemasState {
  const profileType = useProfileTypeValue();
  const appState = useAppStateGetter();
  const isAppStateReady = useAppStateReady();
  const themaItems = themasByProfileType(profileType).toSorted(compareThemas);

  const items = useMemo(() => {
    return themaItems.map((item) => {
      return {
        ...item,
        hasData: item.isActive ? item.isActive(appState) : item.isAlwaysVisible,
      };
    });
  }, [themaItems, appState]);

  return {
    items,
    isLoading: !isAppStateReady,
  };
}

export function useMyThemaMenuItems(): ThemasState {
  const { items, isLoading } = useAllThemaMenuItems();

  return {
    items: items.filter((item) => item.hasData),
    isLoading,
  };
}

export function useAllThemaMenuItemsByThemaID() {
  const { items } = useAllThemaMenuItems();

  const themaById = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.id] = item;
          return acc;
        },
        {} as Record<string, ThemaMenuItemTransformedWithHasData>
      ),
    [items]
  );

  return themaById;
}

export function useThemaMenuItemByThemaID<ID extends string = string>(
  themaID: ID
): ThemaMenuItemTransformed<ID> | null {
  const itemsById = useAllThemaMenuItemsByThemaID();
  return itemsById[themaID]
    ? (itemsById[themaID] as ThemaMenuItemTransformedWithHasData<ID>)
    : null;
}

export function useThemaBreadcrumbs<ID extends string = string>(
  themaID: ID
): LinkProps[] {
  const themaPaginaBreadcrumb = useThemaMenuItemByThemaID(themaID);
  const location = useLocation();
  const from = location?.state?.from;
  const fromPageType = location?.state?.pageType;

  return [
    themaPaginaBreadcrumb
      ? {
          to: themaPaginaBreadcrumb?.to,
          title: themaPaginaBreadcrumb?.title,
        }
      : null,
    themaPaginaBreadcrumb && fromPageType === 'listpage'
      ? {
          to: from,
          title: 'Lijst',
        }
      : null,
  ].filter((link) => link !== null);
}

type PageTypeSetting = 'listpage' | 'none';

const pageTypeSetting = atom<PageTypeSetting>({
  default: 'none',
  key: 'pageTypeSetting',
});

export function usePageTypeSetting(pageTypeRequested: PageTypeSetting) {
  const [pageType, setPageType] = useRecoilState(pageTypeSetting);

  useEffect(() => {
    setPageType(pageTypeRequested);
    return () => {
      setPageType(() => 'none');
    };
  }, [pageTypeRequested]);

  return pageType;
}

export function usePageTypeSettingValue() {
  return useRecoilValue(pageTypeSetting);
}

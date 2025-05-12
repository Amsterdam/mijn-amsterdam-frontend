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

export interface ThemasState {
  items: ThemaMenuItemTransformed[];
  isLoading: boolean;
}

export function useThemaMenuItems(): ThemasState {
  const profileType = useProfileTypeValue();
  const appState = useAppStateGetter();
  const isAppStateReady = useAppStateReady();
  const allThemaItems = themasByProfileType(profileType).sort(
    sortAlpha('title')
  );
  const alwaysFirstThemasIds = [themaIdKVK, themaIdBRP] as string[];
  const themaItems = [
    ...allThemaItems.filter(({ id }) => alwaysFirstThemasIds.includes(id)),
    ...allThemaItems.filter(({ id }) => !alwaysFirstThemasIds.includes(id)),
  ];

  const items = useMemo(() => {
    return themaItems.filter((item) => {
      // Check to see if Thema has been loaded or if it is directly available
      return item.isActive ? item.isActive(appState) : item.isAlwaysVisible;
    });
  }, [themaItems, appState]);

  return {
    items,
    isLoading: !isAppStateReady,
  };
}

export function useThemaMenuItemsByThemaID() {
  const { items } = useThemaMenuItems();

  const themaById = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.id] = item;
          return acc;
        },
        {} as Record<string, ThemaMenuItemTransformed>
      ),
    [items]
  );

  return themaById;
}

export function useThemaMenuItemByThemaID<ID extends string = string>(
  themaID: ID
): ThemaMenuItemTransformed<ID> | null {
  const itemsById = useThemaMenuItemsByThemaID();
  return itemsById[themaID]
    ? (itemsById[themaID] as ThemaMenuItemTransformed<ID>)
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

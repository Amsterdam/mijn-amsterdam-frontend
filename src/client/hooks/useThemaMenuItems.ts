import { useEffect, useMemo } from 'react';

import { useLocation } from 'react-router';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import { useAppStateGetter, useAppStateReady } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { type ThemaID } from '../../universal/config/thema';
import { LinkProps } from '../../universal/types';
import { themasByProfileType } from '../config/menuItems';
import { ThemaMenuItemTransformed } from '../config/thema-types';
import { getThemaMenuItemsAppState, isThemaActive } from '../helpers/themas';

export interface ThemasState {
  items: ThemaMenuItemTransformed[];
  isLoading: boolean;
}

export function useThemaMenuItems(): ThemasState {
  const profileType = useProfileTypeValue();
  const appState = useAppStateGetter();
  const isAppStateReady = useAppStateReady();
  const themaItems = themasByProfileType(profileType);

  const items = useMemo(() => {
    return themaItems.filter((item) => {
      // Check to see if Thema has been loaded or if it is directly available
      return item.isActive
        ? item.isActive(appState)
        : item.isAlwaysVisible || isThemaActive(item, appState);
    });
  }, [themaItems, appState]);

  const themaItemsWithAppState = useMemo(() => {
    return getThemaMenuItemsAppState(appState, themaItems);
  }, [appState, themaItems]);

  const themasState = useMemo(
    () => ({
      items,
      isLoading: !isAppStateReady,
    }),
    [items, appState, themaItemsWithAppState, isAppStateReady]
  );

  return themasState;
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

export function useThemaMenuItemByThemaID(themaID: ThemaID) {
  const itemsById = useThemaMenuItemsByThemaID();
  return itemsById[themaID];
}

export function useThemaBreadcrumbs(themaID: ThemaID): LinkProps[] {
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
    fromPageType === 'listpage'
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

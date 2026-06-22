import { useMemo } from 'react';

import { useAppStateReady } from './useAppStateStore.ts';
import { useProfileTypeValue } from './useProfileType.ts';
import { sortAlpha } from '../../universal/helpers/utils.ts';
import { useThemasByProfileType } from '../config/menuItems.ts';
import type { ThemaMenuItemTransformed } from '../config/thema-types.ts';
import { myThemasMenuItems } from '../config/thema.ts';
import { themaConfig as klantContactThemaConfig } from '../pages/Thema/KlantContact/KlantContact-thema-config.ts';
import { themaConfig as profileThemaConfig } from '../pages/Thema/Profile/Profile-thema-config.ts';
export interface ThemasState {
  items: ThemaMenuItemTransformed[];
  isLoading: boolean;
}

type withIDTitle = { id: string; title: string };
const sortAlphaOnTitle = sortAlpha('title');

export function compareThemas<T extends withIDTitle>(a: T, b: T): 0 | 1 | -1 {
  // These will be placed on top in the order they are put here.
  const themaIDsOnTop = [
    profileThemaConfig.BRP.id,
    profileThemaConfig.KVK.id,
    klantContactThemaConfig.id,
  ] as string[];

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
  const isAppStateReady = useAppStateReady();
  const items = useThemasByProfileType(myThemasMenuItems, profileType).toSorted(
    compareThemas
  );

  return {
    items,
    isLoading: !isAppStateReady,
  };
}

export function useActiveThemaMenuItems(): ThemasState {
  const { items, isLoading } = useAllThemaMenuItems();

  return {
    items: items.filter((item) => item.isActive),
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
        {} as Record<string, ThemaMenuItemTransformed>
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
    ? (itemsById[themaID] as ThemaMenuItemTransformed<ID>)
    : null;
}

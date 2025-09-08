import { useEffect, useCallback } from 'react';

import { create, type UseBoundStore } from 'zustand/react';
import type { StoreApi } from 'zustand/vanilla';

import type { ApiGetState, ApiFetch } from './useDataApi-v2';
import type { ApiResponse } from '../../../universal/helpers/api';

type ItemStore<Item, Key extends keyof Item> = {
  storeItem(item: Item): void;
  getItem(x?: Item[Key]): Item | null;
  hasItem(x?: Item[Key]): boolean;
  deleteItem(x?: Item[Key]): void;
  items: Record<string, Item> | null;
};

export function createItemStoreHook<
  Item extends Record<string, any>,
  Key extends keyof Item = keyof Item,
>(key: Key) {
  return create<ItemStore<Item, Key>>((set, get) => {
    return {
      items: null,
      storeItem: (item) => {
        const x = item[key];
        if (x !== null) {
          set((store) => ({
            items: {
              ...store.items,
              [x]: item,
            },
          }));
        }
      },
      getItem: (x?: Item[Key]) => {
        if (!x) {
          return null;
        }
        return get().items?.[x] ?? null;
      },
      hasItem: (x?: Item[Key]) => {
        if (!x) {
          return false;
        }
        return get().items?.[x] !== undefined;
      },
      deleteItem: (x?: Item[Key]) => {
        if (!x) {
          return;
        }
        set((store) => {
          const newItems = { ...store.items };
          delete newItems[x];
          return { items: newItems };
        });
      },
    };
  });
}

export function useItemStoreWithFetch<X>(
  useFetchHook: UseBoundStore<StoreApi<ApiGetState<ApiResponse<X>> & ApiFetch>>,
  useItemStore: UseBoundStore<StoreApi<ItemStore<X, keyof X>>>,
  key: keyof X,
  x: X[keyof X]
) {
  const api = useFetchHook();
  const itemStore = useItemStore();

  const { data, isLoading, isError, fetch } = api;
  const item = itemStore.getItem(x);
  const itemRemote = data?.content ?? null;
  const hasRemoteDossier = !api.isLoading && itemStore.hasItem(x);

  useEffect(() => {
    if (itemRemote && x && !hasRemoteDossier && itemRemote[key] === x) {
      itemStore.storeItem(itemRemote);
    }
  }, [x, key, itemRemote, hasRemoteDossier]);

  const fetchItem = useCallback(
    (url: string | URL, forceRefetch: boolean = false) => {
      if (forceRefetch || !hasRemoteDossier) {
        fetch(url);
      }
    },
    [fetch, x, hasRemoteDossier]
  );

  return {
    item,
    items: itemStore.items,
    isLoading,
    isError,
    fetch: fetchItem,
  };
}

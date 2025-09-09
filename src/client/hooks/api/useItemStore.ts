import { useEffect, useCallback } from 'react';

import { create, type UseBoundStore } from 'zustand/react';
import type { StoreApi } from 'zustand/vanilla';

import type { ApiGetState, ApiFetch } from './useDataApi-v2';
import { type ApiResponse } from '../../../universal/helpers/api';

type ItemStore<Item, Key extends keyof Item> = {
  storeItem(item: Item, meta?: any): void;
  getItem(x?: Item[Key]): Item | null;
  getMeta(x?: Item[Key]): any | null;
  hasItem(x?: Item[Key]): boolean;
  deleteItem(x?: Item[Key]): void;
  items: Record<string, Item> | null;
  meta: Record<string, any> | null;
};

export function createItemStoreHook<
  Item extends Record<string, any>,
  Key extends keyof Item = keyof Item,
>(key: Key) {
  return create<ItemStore<Item, Key>>((set, get) => {
    return {
      items: null,
      meta: null,
      storeItem: (item, meta) => {
        const x = item[key];
        if (x !== null) {
          set((store) => ({
            items: {
              ...store.items,
              [x]: item,
            },
            meta:
              meta !== null && meta !== undefined
                ? {
                    ...store.meta,
                    [x]: meta,
                  }
                : store.meta,
          }));
        }
      },
      getItem: (x?: Item[Key]) => {
        if (!x) {
          return null;
        }
        return get().items?.[x] ?? null;
      },
      getMeta: (x?: Item[Key]) => {
        if (!x) {
          return null;
        }
        return get().meta?.[x] ?? null;
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

          if (store.meta?.[x]) {
            const newMeta = { ...store.meta };
            delete newMeta[x];
            return { items: newItems, meta: newMeta };
          }

          return { items: newItems };
        });
      },
    };
  });
}

export function useApiStoreByKey<X>(
  useApiHook: UseBoundStore<StoreApi<ApiGetState<ApiResponse<X>> & ApiFetch>>,
  useItemStore: UseBoundStore<StoreApi<ItemStore<X, keyof X>>>,
  key: keyof X,
  x: X[keyof X] | null
) {
  const api = useApiHook();
  const itemStore = useItemStore();

  const { data, isLoading, isError, fetch } = api;
  const item = x ? itemStore.getItem(x) : null;
  const meta = x ? itemStore.getMeta(x) : null;
  const itemRemote = data?.content ?? null;
  const hasRemoteDossier = !api.isLoading && x && itemStore.hasItem(x);

  useEffect(() => {
    if (data && itemRemote && x && !hasRemoteDossier && itemRemote[key] === x) {
      const failedDependencies =
        data.status === 'OK' ? (data.failedDependencies ?? null) : null;
      // Store the item, along with any failed dependencies info. Meta could also be extended in the future. For example with a lastFetched timestamp.
      const meta = failedDependencies ? { failedDependencies } : null;
      itemStore.storeItem(itemRemote, meta);
    }
  }, [x, key, itemRemote, hasRemoteDossier, data]);

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
    meta,
    items: itemStore.items,
    isLoading,
    isError,
    fetch: fetchItem,
  };
}

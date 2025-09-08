import { useEffect } from 'react';

import { create, type UseBoundStore } from 'zustand/react';
import type { StoreApi } from 'zustand/vanilla';

import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';

type ApiFetchResponse<T> = Promise<ApiResponse<T>>;

async function handleResponse<T>(response: Response): ApiFetchResponse<T> {
  const responseJson = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    return apiErrorResult(
      `Request to ${response.url} failed with status ${response.status}.`,
      null
    );
  }

  if ('status' in responseJson && 'content' in responseJson) {
    return responseJson;
  }
  return apiSuccessResult<T>(responseJson);
}

export async function sendFormPostRequest<T extends any>(
  url: string,
  payload: Record<string, string>,
  options?: RequestInit
): ApiFetchResponse<T> {
  return fetch(url, {
    method: 'POST',
    body: new URLSearchParams(payload),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
    ...options,
  }).then((response: Response) => handleResponse<T>(response));
}

export async function sendJSONPostRequest<T extends any>(
  url: string,
  payload: Record<string, unknown>,
  options?: RequestInit
): ApiFetchResponse<T> {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  }).then((response: Response) => handleResponse<T>(response));
}

type ApiGetState<T> = {
  data: T | null;
  errorData: string | null;
  isDirty: boolean;
  isError: boolean;
  isLoading: boolean;
};

type ApiFetch = {
  fetch(url?: URL | string, init_?: RequestInit): Promise<void>;
};

const initialState: ApiGetState<null> = {
  isLoading: false,
  isError: false,
  data: null,
  errorData: null,
  isDirty: false,
};

export async function sendGetRequest<T extends any>(
  url: URL | string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetch(url, { credentials: 'include', ...options }).then(
    (response: Response) => handleResponse<T>(response)
  );
}

type ApiGetOptions = {
  defaultUrl?: URL | string;
  init?: RequestInit;
  sendRequest?: <T>(
    url: URL | string,
    init?: RequestInit
  ) => Promise<ApiResponse<T>>;
};

export function createGetApiHook<T>(options?: ApiGetOptions) {
  const { defaultUrl, sendRequest = sendGetRequest, init } = options || {};

  return create<ApiGetState<ApiResponse<T>> & ApiFetch>((set, get) => ({
    ...initialState,

    async fetch(url?: URL | string, init_?: RequestInit): Promise<void> {
      const url_ = url || defaultUrl;
      if (!url_) {
        throw new Error('No URL provided');
      }

      set({ isLoading: true });

      const response = await sendRequest<T>(
        url_,
        init_ ?? init // TODO: Should we merge these inits?
      );

      if (response.status === 'ERROR') {
        set({
          data: null,
          errorData: response.message,
          isDirty: true,
          isError: true,
          isLoading: false,
        });
      } else {
        set({
          data: response,
          errorData: null,
          isDirty: true,
          isError: false,
          isLoading: false,
        });
      }
    },
  }));
}

export const HttpStatusCode = {
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
};

export function isAborted(error: unknown): boolean {
  return !!error?.toString().includes('AbortError: The operation was aborted.');
}

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
  const hasRemoteDossier = itemStore.hasItem(x);

  useEffect(() => {
    if (itemRemote && x && !hasRemoteDossier && itemRemote[key] === x) {
      itemStore.storeItem(itemRemote);
    }
  }, [x, key, itemRemote, hasRemoteDossier]);

  return {
    item,
    items: itemStore.items,
    isLoading,
    isError,
    fetch: (url: string | URL) => {
      if (x && !hasRemoteDossier) {
        fetch(url);
      }
    },
  };
}

import { useCallback, useEffect, useLayoutEffect } from 'react';

import { create } from 'zustand';

import type { RecordStr2 } from '../../../server/routing/route-helpers';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import type { SomeOtherString } from '../../../universal/helpers/types';

type ApiFetchResponse<T> = Promise<ApiResponse<T>>;
// Extend RequestInit to include a payload property. The body property always takes precedence over payload.
// E.g: if both body and payload are provided, body will be used.
type RequestInitWithPayload<P extends RecordStr2 = RecordStr2> = RequestInit & {
  payload?: P;
};

type UrlOrString = URL | string;

async function handleResponse<T>(
  fetchFn: () => Promise<Response>
): ApiFetchResponse<T> {
  try {
    const response = await fetchFn();
    const responseJson = (await response.json()) as ApiResponse<T>;

    if (!response.ok || responseJson.status === 'ERROR') {
      const error =
        `HTTP Error: Request to ${response.url} failed with status ${response.status} ${responseJson && 'message' in responseJson ? `message: ${responseJson.message}` : ''}`.trim();

      throw new Error(error);
    }

    if (responseJson.status === 'POSTPONE') {
      return responseJson;
    }

    // Test if the response is already in ApiResponse format
    if ('status' in responseJson && 'content' in responseJson) {
      return responseJson;
    }

    let responseContent: T | null = responseJson;

    if (!('status' in responseJson) && 'content' in responseJson) {
      responseContent = (responseJson as { content: T }).content;
    }

    // If not, wrap it in a success ApiResponse
    return apiSuccessResult<T>(responseContent);
  } catch (error: unknown) {
    return apiErrorResult(
      (error as Error)?.message ?? `Unknown error: ${error}`,
      null
    );
  }
}

/**
 *
 * @param url
 * @param init Payload can be a regular object and will be converted to URLSearchParams. The provided body however, takes precedence over payload.
 * @returns
 */
export async function sendFormPostRequest<T, P extends RecordStr2 = RecordStr2>(
  url: string | URL,
  init?: RequestInitWithPayload<P>
): ApiFetchResponse<T> {
  return handleResponse<T>(() =>
    fetch(url, {
      method: 'POST',
      body: init?.payload ? new URLSearchParams(init.payload) : init?.body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      ...init,
    })
  );
}

/**
 *
 * @param url
 * @param init Payload can be a regular object and will be converted to URLSearchParams. The provided body however, takes precedence over payload.
 * @returns
 */
export async function sendJSONPostRequest<T, P extends RecordStr2 = RecordStr2>(
  url: string | URL,
  init?: RequestInitWithPayload<P>
): ApiFetchResponse<T> {
  return handleResponse<T>(() =>
    fetch(url, {
      method: 'POST',
      body: init?.payload ? JSON.stringify(init.payload) : init?.body,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...init,
    })
  );
}

export async function sendFetchRequest<T>(
  url: UrlOrString,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  return handleResponse<T>(() =>
    fetch(url, { credentials: 'include', ...init })
  );
}

export type BffApiState<D> = {
  /**
   * The data returned from the API
   */
  data: D | null;
  /** The error message when the request failed
   */
  errorData: string | null;
  /**
   * Whether the data has been fetched at least once
   */
  isDirty: boolean;
  /**
   * Whether the request returned an error
   */
  isError: boolean;
  /**
   * Whether the data is currently being fetched
   */
  isLoading: boolean;
};

export type BFFApiHook<
  T,
  P extends RecordStr2 = RecordStr2,
  U = UrlOrString,
> = BffApiState<ApiResponse<T>> & {
  fetch: (
    url?: UrlOrString | RequestInitWithPayload<P>,
    init_?: U extends UrlOrString ? RequestInitWithPayload<P> : never
  ) => void;
  optimisticUpdateContent: (content: T) => void;
  isPristine: boolean;
};

const initialState: BffApiState<null> = Object.seal({
  isLoading: false,
  isError: false,
  data: null,
  errorData: null,
  isDirty: false,
});

type BffApiOptions<T, P extends RecordStr2> = {
  url?: UrlOrString;
  init?: RequestInitWithPayload<P>;
  fetchImmediately?: boolean;
  sendRequest?: (
    url: UrlOrString,
    init?: RequestInitWithPayload<P>
  ) => Promise<ApiResponse<T>>;
};

type StoreKey = Exclude<SomeOtherString, 'set' | 'get' | 'has'>;
type SetState = <T>(
  key: StoreKey,
  state: BffApiState<ApiResponse<T> | null>
) => void;
type GetState = <T>(key: StoreKey) => BffApiState<ApiResponse<T> | null>;
type HasState = (key: StoreKey) => boolean;

type BFFApiStore = {
  set: SetState;
  get: GetState;
  has: HasState;
} & { [key in StoreKey]: unknown }; // see https://github.com/pmndrs/zustand/discussions/2566, it's not possible to type this strictly as zustand doesn't support generics in the store itself.

export const useBffApiStateStore = create<BFFApiStore>((set, get) => ({
  set: (key, state) => set({ [key]: state }),
  get: <T>(key: StoreKey) => {
    const state = get();
    const x = state[key] as BffApiState<ApiResponse<T> | null>;
    return x;
  },
  has: (key) => key in get(),
}));

export function useBffApi<
  T,
  P extends RecordStr2 = RecordStr2,
  U = UrlOrString,
>(
  cacheKey: string | null | undefined,
  options?: BffApiOptions<T, P>
): BFFApiHook<T, P, U> {
  const {
    url,
    sendRequest = sendFetchRequest,
    fetchImmediately = true,
  } = options || {};

  const isUrlOrPathLike =
    !!cacheKey &&
    (cacheKey.startsWith('http') || cacheKey.match(/^\/api\/v(\d+)\//));

  if (
    !url &&
    cacheKey &&
    // NOTE: not an ideal way to check this, but good enough for now.
    !isUrlOrPathLike &&
    fetchImmediately === true
  ) {
    const error =
      'When using a cacheKey that is not an URL or path, you must provide a URL in the options parameter or set fetchImmediately to false';
    throw new Error(error);
  }

  const store = useBffApiStateStore();
  const state = cacheKey ? store.get<T>(cacheKey) : null;
  const rState = state ? state : initialState;
  const url_ = url || cacheKey;

  const storeSet = store.set;
  const storeHas = store.has;
  const storeGet = store.get;
  const isDirty = state?.isDirty === true;
  const isLoading = state?.isLoading === true;

  const hasKeyInStore = !!cacheKey && storeHas(cacheKey);

  const setApiState = useCallback(
    (partialState: Partial<BffApiState<ApiResponse<T | null> | null>>) => {
      if (cacheKey) {
        const state = storeGet<T>(cacheKey);
        const newState = { ...state, ...partialState };
        storeSet(cacheKey, newState);
      }
    },
    [storeGet, storeSet, cacheKey]
  );

  const fetch = useCallback(
    async (
      urlOrInit?: UrlOrString | RequestInitWithPayload<P>,
      init?: RequestInitWithPayload<P>
    ) => {
      const reqUrl =
        typeof urlOrInit === 'string' || urlOrInit instanceof URL
          ? urlOrInit
          : url_;
      const init_ =
        urlOrInit &&
        !init &&
        !(typeof urlOrInit === 'string' || urlOrInit instanceof URL)
          ? urlOrInit
          : init;

      if (!reqUrl) {
        throw new Error('No URL provided');
      }

      setApiState({ isLoading: true });

      const response = await sendRequest(reqUrl, {
        ...options?.init,
        ...init_,
      });

      if (response.status === 'ERROR') {
        return setApiState({
          ...initialState,
          errorData: response.message,
          isDirty: true,
          isError: true,
        });
      }
      return setApiState({
        ...initialState,
        data: response,
        isDirty: true,
      });
    },
    [options?.init, sendRequest, setApiState, url_]
  );

  // Allows optimistic updating of the content in the API response.
  // E.g. after a successful POST/PATCH/PUT request, we can optimistically update the content
  // of the GET request in the store without refetching.
  const optimisticUpdateContent = useCallback(
    (content: T | null) => {
      if (rState.data?.content && rState.data.status === 'OK') {
        setApiState({
          data: {
            ...rState.data,
            content,
          },
        });
      }
    },
    [rState.data, setApiState]
  );

  // Sets initial state in the store if not present.
  useEffect(() => {
    if (cacheKey && !storeHas(cacheKey)) {
      storeSet(cacheKey, initialState);
    }
  }, [
    state,
    url_,
    cacheKey,
    storeSet,
    storeHas,
    options?.fetchImmediately,
    fetch,
    storeGet,
  ]);

  // Fetch data immediately if required.
  useLayoutEffect(() => {
    if (
      cacheKey &&
      !storeHas(cacheKey) &&
      options?.fetchImmediately !== false &&
      isDirty === false &&
      isLoading === false
    ) {
      fetch();
    }
  }, [
    storeHas,
    options?.fetchImmediately,
    fetch,
    hasKeyInStore,
    isDirty,
    isLoading,
    cacheKey,
  ]);

  return Object.assign({}, rState, {
    fetch,
    optimisticUpdateContent,
    isPristine: rState.isDirty === false && rState.isLoading === false,
  });
}

// Axios also has these codes but we do not import them for reduced bundle size.
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

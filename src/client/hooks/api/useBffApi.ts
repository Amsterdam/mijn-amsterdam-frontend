import { useCallback, useEffect } from 'react';

import { create } from 'zustand';

import type { RecordStr2 } from '../../../server/routing/route-helpers';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import type { SomeOtherString } from '../../../universal/helpers/types';

type ApiFetchResponse<T> = Promise<ApiResponse<T>>;

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

export async function sendFormPostRequest<
  T extends any,
  P extends RecordStr2 = RecordStr2,
>(
  url: string | URL,
  init?: RequestInit & { payload?: P }
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

export async function sendJSONPostRequest<
  T extends any,
  P extends RecordStr2 = RecordStr2,
>(
  url: string | URL,
  init?: RequestInit & { payload?: P }
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

export async function sendGetRequest<T extends any>(
  url: URL | string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  return handleResponse<T>(() =>
    fetch(url, { credentials: 'include', ...init })
  );
}

export type BffApiState<T> = {
  /**
   * The data returned from the API
   */
  data: T | null;
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

const initialState: BffApiState<null> = Object.seal({
  isLoading: false,
  isError: false,
  data: null,
  errorData: null,
  isDirty: false,
});

type BffApiOptions<T, P> = {
  url?: URL | string;
  init?: RequestInit;
  fetchImmediately?: boolean;
  sendRequest?: (
    url: URL | string,
    init?: RequestInit & { payload?: P }
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
} & { [key in StoreKey]: any }; // see https://github.com/pmndrs/zustand/discussions/2566, it's not possible to type this strictly as zustand doesn't support generics in the store itself.

export const useBffApiStateStore = create<BFFApiStore>((set, get) => ({
  set: (key, state) => set({ [key]: state }),
  get: <T>(key: StoreKey) => {
    const state = get();
    const x = state[key] as BffApiState<ApiResponse<T> | null>;
    return x;
  },
  has: (key) => key in get(),
}));

export function useBffApi<T, P>(
  urlOrKey: string | null | undefined,
  options?: BffApiOptions<T, P>
): BffApiState<ApiResponse<T> | null> & {
  fetch:
    | ((url?: URL | string, init_?: RequestInit & { payload?: P }) => void)
    | ((init_?: RequestInit & { payload?: P }) => void);
  optimisticUpdateContent: (payload: Partial<T>) => void;
  isPristine: boolean;
} {
  const {
    url,
    sendRequest = sendGetRequest,
    fetchImmediately = true,
  } = options || {};

  const isUrlOrPathLike =
    !!urlOrKey &&
    (urlOrKey.startsWith('http') || urlOrKey.match(/^\/api\/v(\d+)\//));

  if (
    !url &&
    urlOrKey &&
    // NOTE: not an ideal way to check this, but good enough for now.
    !isUrlOrPathLike &&
    fetchImmediately === true
  ) {
    const error =
      'When using a key, you must provide a URL in the options parameter or set fetchImmediately to false';
    throw new Error(error);
  }

  const store = useBffApiStateStore();
  const state = urlOrKey ? store.get<T>(urlOrKey) : null;
  const rState = state ? state : initialState;
  const url_ = url || urlOrKey;

  const storeSet = store.set;
  const storeHas = store.has;
  const storeGet = store.get;
  const isDirty = state?.isDirty === true;
  const isLoading = state?.isLoading === true;

  const hasKey = !!urlOrKey && storeHas(urlOrKey);

  const setApiState = useCallback(
    (partialState: Partial<BffApiState<ApiResponse<T> | null>>) => {
      if (urlOrKey) {
        const state = storeGet<T>(urlOrKey);
        const newState = { ...state, ...partialState };
        storeSet(urlOrKey, newState);
      }
    },
    [storeGet, storeSet, urlOrKey]
  );

  const fetch = useCallback(
    async (url?: string | URL, init?: RequestInit) => {
      const reqUrl = url ?? url_;

      if (!reqUrl) {
        throw new Error('No URL provided');
      }

      setApiState({ isLoading: true });

      const response = await sendRequest(reqUrl, { ...options?.init, ...init });

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

  const optimisticUpdateContent = useCallback(
    (payload: Partial<T>) => {
      if (rState.data?.content && rState.data.status === 'OK') {
        setApiState({
          data: {
            ...rState.data,
            content: { ...rState.data?.content, ...payload },
          },
        });
      }
    },
    [rState.data, setApiState]
  );

  useEffect(() => {
    if (urlOrKey && !storeHas(urlOrKey)) {
      storeSet(urlOrKey, initialState);
    }
  }, [
    state,
    url_,
    urlOrKey,
    storeSet,
    storeHas,
    options?.fetchImmediately,
    fetch,
    storeGet,
  ]);

  useEffect(() => {
    if (
      urlOrKey &&
      options?.fetchImmediately !== false &&
      isDirty === false &&
      isLoading === false
    ) {
      fetch();
    }
  }, [options?.fetchImmediately, fetch, hasKey, isDirty, isLoading, urlOrKey]);

  return Object.assign({}, rState, {
    fetch,
    optimisticUpdateContent,
    isPristine: rState.isDirty === false && rState.isLoading === false,
  });
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

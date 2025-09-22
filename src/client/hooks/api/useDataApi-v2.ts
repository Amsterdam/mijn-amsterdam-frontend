import { useCallback, useEffect } from 'react';

import { create } from 'zustand';

import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';

type ApiFetchResponse<T> = Promise<ApiResponse<T>>;

async function handleResponse<T>(fetchFn: () => Promise<Response>) {
  try {
    const response = await fetchFn();
    const responseJson = (await response.json()) as ApiResponse<T>;

    if (!response.ok || responseJson.status === 'ERROR') {
      throw new Error(
        `HTTP Error: Request to ${response.url} failed with status ${response.status} ${responseJson && 'message' in responseJson ? `message: ${responseJson.message}` : ''}`.trim()
      );
    }

    // Verify that we have ApiResponse signature
    if ('status' in responseJson && 'content' in responseJson) {
      return responseJson;
    }

    return apiSuccessResult<T>(responseJson);
  } catch (error: unknown) {
    return apiErrorResult(
      (error as Error).message ?? `Unknown error: ${error}`,
      null
    );
  }
}

export async function sendFormPostRequest<T extends any>(
  url: string,
  payload: Record<string, string>,
  options?: RequestInit
): ApiFetchResponse<T> {
  return handleResponse(() =>
    fetch(url, {
      method: 'POST',
      body: new URLSearchParams(payload),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      ...options,
    })
  );
}

export async function sendJSONPostRequest<T extends any>(
  url: string,
  payload: Record<string, unknown>,
  options?: RequestInit
): ApiFetchResponse<T> {
  return handleResponse(() =>
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    })
  );
}

export async function sendGetRequest<T extends any>(
  url: URL | string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return handleResponse(() =>
    fetch(url, { credentials: 'include', ...options })
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

export type ApiFetch<T> = {
  fetch(url?: URL | string, init_?: RequestInit): Promise<T | null>;
};

const initialState: BffApiState<null> = Object.seal({
  isLoading: false,
  isError: false,
  data: null,
  errorData: null,
  isDirty: false,
});

type BffApiOptions<T> = {
  url?: URL | string;
  init?: RequestInit;
  fetchImmediately?: boolean;
  sendRequest?: (
    url: URL | string,
    init?: RequestInit
  ) => Promise<ApiResponse<T>>;
};

type StoreKey = string;
type SetState = <T>(
  key: StoreKey,
  state: BffApiState<ApiResponse<T> | null>
) => void;
type GetState = <T>(key: StoreKey) => BffApiState<ApiResponse<T> | null>;
type HasState = (key: StoreKey) => boolean;

type StoreExample = {
  set: SetState;
  get: GetState;
  has: HasState;
} & { [key in StoreKey]?: BffApiState<ApiResponse<unknown> | null> };

export const useBffApiStateStore = create<StoreExample>((set, get) => ({
  set: (key, state) => set({ [key]: state }),
  get: (key: StoreKey) => {
    const state = get();
    return state[key];
  },
  has: (key: StoreKey) => key in get(),
}));

export function useBffApi<T>(
  urlOrKey: string | null | undefined,
  options?: BffApiOptions<T>
): BffApiState<ApiResponse<T> | null> & {
  fetch: (url?: URL | string, init_?: RequestInit) => void;
} {
  const { url, sendRequest = sendGetRequest } = options || {};
  const store = useBffApiStateStore();
  const state = urlOrKey ? store.get<T>(urlOrKey) : null;
  const url_ = url || urlOrKey;
  // const stateKeyRef = useRef<Set<string>>(new Set());

  const storeSet = store.set;
  const storeHas = store.has;
  const storeGet = store.get;
  const isDirty = state?.isDirty === true;
  const isLoading = state?.isLoading === true;

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

  useEffect(() => {
    // Query logic
    console.log('i fire once');
  }, []);

  const fetch = useCallback(
    (url?: string | URL, init?: RequestInit) => {
      const reqUrl = url ?? url_;

      if (!reqUrl) {
        console.error('[useBffApi] No URL provided for fetch');
        throw new Error('No URL provided');
      }

      console.log('[useBffApi] fetching', reqUrl);
      setApiState({ ...initialState, isLoading: true });

      sendRequest(reqUrl, { ...options?.init, ...init }).then((response) => {
        if (response.status === 'ERROR') {
          console.log('[useBffApi] store error response', response);
          return setApiState({
            ...initialState,
            errorData: response.message,
            isDirty: true,
            isError: true,
          });
        }
        console.log('[useBffApi] store success response');
        console.dir(response, { depth: null });
        return setApiState({
          ...initialState,
          data: response,
          isDirty: true,
        });
      });
    },
    [options?.init, sendRequest, setApiState, url_]
  );

  useEffect(() => {
    // Because the the state can only be read after a re-render, we need to
    // track if this is the first run to set the initial state.
    // Otherwise we would set the initial state on every render.
    // Also, pristine is only true when the state is not yet set AND we want to fetch immediately.
    // Sets initial state for specific key
    if (urlOrKey && storeHas(urlOrKey)) {
      console.log(
        `[useBffApi] initializing state for key ${urlOrKey}, store has key:`
      );
      console.dir(storeGet(urlOrKey), { depth: null });
      // Double check in store if key is already set (in case of multiple components using the same key)
      // If not, set the initial state
      // This should only run once per key (urlOrKey
    }
    if (urlOrKey && !storeHas(urlOrKey)) {
      console.log('store.set.initial');
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

  const hasKey = !!urlOrKey && storeHas(urlOrKey);

  useEffect(() => {
    console.log(
      `[useBffApi] useEffect fetchImmediately: ${options?.fetchImmediately}, hasKey: ${hasKey}`
    );
    // TODO: Implement: what to do if we have an error
    if (
      options?.fetchImmediately !== false &&
      isDirty === false &&
      isLoading === false
    ) {
      console.log('store.fetch');
      fetch();
    }
    return () => {
      console.log('[useBffApi] unmounting, aborting fetch if needed????');
    };
  }, [options?.fetchImmediately, fetch, hasKey, isDirty, isLoading]);

  const rState = state ? state : initialState;

  return Object.assign({}, rState, { fetch });
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

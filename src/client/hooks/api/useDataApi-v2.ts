import { useCallback, useEffect, useRef } from 'react';

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
  /**
   * Whether the data has not been fetched yet and is not loading.
   */
  isPristine: boolean;
};

export type ApiFetch<T> = {
  fetch(url?: URL | string, init_?: RequestInit): Promise<T | null>;
};

const initialState: BffApiState<null> = {
  isLoading: false,
  isError: false,
  data: null,
  errorData: null,
  isDirty: false,
  isPristine: true,
};

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
  const stateKeyRef = useRef<Set<string>>(new Set());
  const storeSet = store.set;
  const storeHas = store.has;
  const storeGet = store.get;

  const setState = useCallback(
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
    (url?: string | URL, init?: RequestInit) => {
      const reqUrl = url ?? url_;

      if (!reqUrl) {
        throw new Error('No URL provided');
      }

      setState({ isLoading: true, isPristine: false });

      sendRequest(reqUrl, { ...options?.init, ...init }).then((response) => {
        if (response.status === 'ERROR') {
          return setState({
            data: null,
            errorData: response.message,
            isDirty: true,
            isError: true,
            isLoading: false,
          });
        }
        return setState({
          data: response,
          errorData: null,
          isDirty: true,
          isError: false,
          isLoading: false,
        });
      });
    },
    [options?.init, sendRequest, setState, url_]
  );

  useEffect(() => {
    // Because the the state can only be read after a re-render, we need to
    // track if this is the first run to set the initial state.
    // Otherwise we would set the initial state on every render.
    // Also, pristine is only true when the state is not yet set AND we want to fetch immediately.
    let isPristine = false;
    // Sets initial state for specific key
    if (
      urlOrKey &&
      !stateKeyRef.current?.has(urlOrKey) &&
      !storeHas(urlOrKey)
    ) {
      stateKeyRef.current?.add(urlOrKey);
      storeSet(urlOrKey, initialState);
      isPristine = true;
    }
    // TODO: Implement: what to do if we have an error
    if (options?.fetchImmediately !== false && isPristine && url_ && urlOrKey) {
      fetch();
    }
  }, [
    state,
    url_,
    urlOrKey,
    storeSet,
    storeHas,
    options?.fetchImmediately,
    fetch,
  ]);

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

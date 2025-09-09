import { create } from 'zustand/react';

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

export type ApiGetState<T> = {
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

export type ApiFetch = {
  fetch(url?: URL | string, init_?: RequestInit): Promise<void>;
};

const initialState: ApiGetState<null> = {
  isLoading: false,
  isError: false,
  data: null,
  errorData: null,
  isDirty: false,
  isPristine: true,
};

export async function sendGetRequest<T extends any>(
  url: URL | string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetch(url, { credentials: 'include', ...options }).then(
    (response: Response) => handleResponse<T>(response)
  );
}

type ApiGetOptions<T> = {
  defaultUrl?: URL | string;
  init?: RequestInit;
  sendRequest?: (
    url: URL | string,
    init?: RequestInit
  ) => Promise<ApiResponse<T>>;
};

export function createApiHook<T>(options?: ApiGetOptions<T>) {
  const { defaultUrl, sendRequest = sendGetRequest, init } = options || {};

  return create<ApiGetState<ApiResponse<T>> & ApiFetch>((set, get) => ({
    ...initialState,

    async fetch(url?: URL | string, init_?: RequestInit): Promise<void> {
      const url_ = url || defaultUrl;
      if (!url_) {
        throw new Error('No URL provided');
      }

      set({ isLoading: true, isPristine: false });

      const response = await sendRequest(
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

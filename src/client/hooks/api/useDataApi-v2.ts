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

type ApiGetState<T> = {
  isLoading: boolean;
  success: boolean;
  isDirty: boolean;
  isError: boolean;
  data: T | null;
  errorData: string | null;
};

type ApiFetch = {
  fetch(url?: URL | string, init_?: RequestInit): Promise<void>;
};

const initialState: ApiGetState<null> = {
  isLoading: false,
  success: false,
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
      if (!url && !defaultUrl) {
        throw new Error('No URL provided');
      }

      set({ ...initialState, isLoading: true });

      const response = await sendRequest<T>(
        url ? url : defaultUrl ? defaultUrl : '',
        init_ ?? init // TODO: Should we merge these inits?
      );

      if (response.status === 'ERROR') {
        set({
          ...initialState,
          isError: true,
          errorData: response.message,
          isDirty: true,
        });
      }

      set({ ...initialState, success: true, data: response, isDirty: true });
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

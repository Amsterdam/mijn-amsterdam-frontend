import { create } from 'zustand';

import {
  apiErrorResult,
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

  return responseJson;
}

export async function sendGetRequest<T extends any>(
  url: string
): Promise<ApiResponse<T>> {
  return fetch(url, { credentials: 'include' }).then((response: Response) =>
    handleResponse<T>(response)
  );
}

export async function sendFormPostRequest<
  T extends any,
  F extends Record<string, string>,
>(url: string, payload: F): ApiFetchResponse<T> {
  return fetch(url, {
    method: 'POST',
    body: new URLSearchParams(payload),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
  }).then((response: Response) => handleResponse<T>(response));
}

export async function sendJSONPostRequest<
  T extends any,
  F extends Record<string, string>,
>(url: string, payload: F): ApiFetchResponse<T> {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  }).then((response: Response) => handleResponse<T>(response));
}

type ApiGetState<T> = {
  loading: boolean;
  success: boolean;
  dirty: boolean;
  error: boolean;
  data: T | null;
  errorData: string | null;
};

type ApiFetch = {
  fetch(): Promise<void>;
};

const initialState: ApiGetState<null> = {
  loading: false,
  success: false,
  error: false,
  data: null,
  errorData: null,
  dirty: false,
};

export function createGetApiHook<T>(url: string) {
  return create<ApiGetState<ApiResponse<T>> & ApiFetch>((set, get) => ({
    ...initialState,

    async fetch(): Promise<void> {
      set({ ...initialState, loading: true });

      const response = await sendGetRequest<T>(url);

      if (response.status === 'ERROR') {
        console.error('Error in data fetch:', response);
        set({
          ...initialState,
          error: true,
          errorData: response.message,
          dirty: true,
        });
      }

      set({ ...initialState, success: true, data: response, dirty: true });
    },
  }));
}

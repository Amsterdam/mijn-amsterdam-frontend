import { useCallback, useEffect, useReducer, useState } from 'react';

import axios, { AxiosRequestConfig, AxiosResponseTransformer } from 'axios';
import useSWR, { type SWRResponse } from 'swr';

import {
  apiErrorResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { Action } from '../../../universal/types/App.types';
import { captureException } from '../../helpers/monitoring';

export interface ApiRequestOptions extends AxiosRequestConfig {
  postpone?: boolean;
  monitoringEnabled?: boolean;
}

const REQUEST_TIMEOUT = 20000; // 20seconds;

export interface ApiState<T> {
  isLoading: boolean;
  isError: boolean;
  isPristine: boolean;
  isDirty: boolean;
  data: T;
}

export type RefetchFunction = (options?: Partial<ApiRequestOptions>) => void;

/**
 * Concepts in this hook are described in the following article:
 * https://www.robinwieruch.de/react-hooks-fetch-data/
 */

const ActionTypes = {
  FETCH_INIT: 'FETCH_INIT',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
};

function createApiDataReducer<T>() {
  return (state: ApiState<T>, action: Action): ApiState<T> => {
    switch (action.type) {
      case ActionTypes.FETCH_INIT:
        return { ...state, isLoading: true, isError: false };
      case ActionTypes.FETCH_SUCCESS:
        return {
          ...state,
          isLoading: false,
          isError: false,
          isPristine: false,
          isDirty: true,
          data: action.payload,
        };
      case ActionTypes.FETCH_FAILURE:
        return {
          ...state,
          isLoading: false,
          isError: true,
          isPristine: false,
          isDirty: true,
          data: action.payload,
        };
      default:
        throw new Error();
    }
  };
}

// The data api request options object
export const DEFAULT_REQUEST_OPTIONS: ApiRequestOptions = {
  // Postpone fetch when hook is called/set-up for the first time
  postpone: false,
  responseType: 'json',
  method: 'get',
  monitoringEnabled: true,
};

export function getDefaultState<T>(initialData: T, postpone = false) {
  return {
    isLoading: postpone === true ? false : true,
    isError: false,
    isPristine: true,
    isDirty: false,
    data: initialData,
  };
}

export function useDataApi<T>(
  options: ApiRequestOptions = DEFAULT_REQUEST_OPTIONS,
  initialData: T
): [ApiState<T>, RefetchFunction] {
  const [requestOptions, setRequestOptions] = useState(options);
  const [initialDataNoContent] = useState(initialData);
  const apiDataReducer = createApiDataReducer<T>();

  const refetch = useCallback(
    (refetchOptions?: Partial<ApiRequestOptions>) => {
      setRequestOptions((options) => ({
        ...options,
        ...refetchOptions,
        postpone: false,
      }));
    },
    [setRequestOptions]
  );

  const [state, dispatch] = useReducer(
    apiDataReducer,
    getDefaultState<T>(initialDataNoContent, requestOptions.postpone)
  );

  useEffect(() => {
    let didCancel = false;
    let requestTimeout;

    const fetchData = async () => {
      const source = axios.CancelToken.source();

      requestTimeout = setTimeout(() => {
        source.cancel('Request timeout.');
      }, REQUEST_TIMEOUT);

      dispatch({
        type: ActionTypes.FETCH_INIT,
      });

      const requestOptionsFinal: AxiosRequestConfig = {
        ...DEFAULT_REQUEST_OPTIONS,
        ...requestOptions,
        cancelToken: source.token,
        withCredentials: true,
      };
      if (requestOptions.transformResponse) {
        requestOptionsFinal.transformResponse = addAxiosResponseTransform(
          requestOptions.transformResponse
        );
      }

      try {
        let result = null;

        switch (requestOptionsFinal.method?.toLowerCase()) {
          case 'post':
            result = await axios.post(
              requestOptionsFinal.url!,
              requestOptionsFinal.data,
              requestOptionsFinal
            );
            break;
          default:
          case 'get':
            result = await axios.get(
              requestOptionsFinal.url!,
              requestOptionsFinal
            );
            break;
        }

        if (!result) {
          throw new Error('useDataApi request Method not implemented.');
        }

        if (!didCancel) {
          dispatch({
            type: ActionTypes.FETCH_SUCCESS,
            payload: result.data || initialDataNoContent,
          });
        }
      } catch (error: any) {
        if (!didCancel) {
          const errorMessage = error.response?.data?.message || error.message;
          const payload = apiErrorResult(
            errorMessage,
            (initialDataNoContent as any)?.content || null
          );

          dispatch({
            type: ActionTypes.FETCH_FAILURE,
            payload,
          });

          if (requestOptions.monitoringEnabled) {
            captureException(error, {
              properties: {
                errorMessage,
                url: requestOptions.url,
              },
            });
          }
        }
      }

      clearTimeout(requestTimeout);
    };

    if (requestOptions.postpone !== true && !!requestOptions.url) {
      fetchData();
    }
    // When component is destroyed this callback is executed.
    return () => {
      didCancel = true;
    };
    // data passed here is used to compare if the effect should re-run.
    // See: https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  }, [requestOptions, initialDataNoContent]);

  return [state, refetch];
}

export function addAxiosResponseTransform(
  transformer: AxiosResponseTransformer | AxiosResponseTransformer[]
) {
  return [
    ...(Array.isArray(axios.defaults.transformResponse)
      ? axios.defaults.transformResponse
      : axios.defaults.transformResponse
        ? [axios.defaults.transformResponse]
        : []),
    ...(Array.isArray(transformer) ? transformer : [transformer]),
  ];
}

//// V2 ////

export type ApiStateV2<T> = {
  isLoading: boolean;
  isError: boolean;
  data: T | null;
  fetch: () => void;
  mutate: SWRResponse['mutate'];
};

type UseDataApiOptions<T> = Readonly<{
  postpone?: boolean;
  fetcher(url: string): Promise<T>;
}>;

const DEFAULT_DATA_API_OPTIONS: Required<UseDataApiOptions<any>> = {
  postpone: false,
  fetcher: sendGetRequest,
};

export function useDataApiV2<T extends any>(
  url?: string,
  options: UseDataApiOptions<T> = DEFAULT_DATA_API_OPTIONS
): ApiStateV2<T> {
  const optionsWithDefaults: Required<UseDataApiOptions<T>> = {
    ...DEFAULT_DATA_API_OPTIONS,
    ...options,
  };

  const [shouldFetch, setShouldFetch] = useState(
    optionsWithDefaults.postpone !== true
  );

  const swr = useSWR<T>(shouldFetch ? url : null, optionsWithDefaults.fetcher, {
    dedupingInterval: 0, // Disable deduping to allow immediate re-fetching
    revalidateOnFocus: false, // Disable revalidation on focus
    revalidateOnReconnect: false, // Disable revalidation on reconnect
    keepPreviousData: true, // Keep previous data while fetching new data
    onSuccess: () => {
      // Sets shouldFetch to false after a successful fetch
      // This prevents immediate re-fetching if the url changes in the meantime.
      if (optionsWithDefaults.postpone) {
        setShouldFetch(false);
      }
    },
    onError: (error) => {
      if (optionsWithDefaults.postpone) {
        setShouldFetch(false);
      }
      captureException(error, {
        properties: {
          url,
          postpone: optionsWithDefaults.postpone,
        },
      });
    },
  });

  // If the hook should fetch data as soons as it's mounted, we consider it as loading.
  const shouldFetchImmediately = !optionsWithDefaults.postpone && !swr.data;

  return {
    data: swr.data ?? null,
    isLoading: swr.isLoading || shouldFetchImmediately,
    isError: !!swr.error,
    mutate: swr.mutate,
    fetch: () => {
      setShouldFetch(true);

      // Trigger a re-fetch for all subsequent calls.
      if (shouldFetch) {
        swr.mutate();
      }
    },
  };
}

export async function sendGetRequest<T extends any>(url: string): Promise<T> {
  return fetch(url, { credentials: 'include' }).then(
    async (response: Response) => {
      const responseJson = (await response.json()) as ApiResponse<T>;
      if (responseJson.status !== 'OK' || !response.ok) {
        throw new Error(
          responseJson.status === 'ERROR'
            ? responseJson.message
            : `Get request to ${url} failed with status ${response.status}.`
        );
      }

      return responseJson.content;
    }
  );
}

export async function sendFormPostRequest<
  T extends any,
  F extends Record<string, string>,
>(url: string, payload: F): Promise<T> {
  return fetch(url, {
    method: 'POST',
    body: new URLSearchParams(payload),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
  }).then(async (response: Response) => {
    const responseJson = (await response.json()) as ApiResponse<T>;
    if (responseJson.status !== 'OK' || !response.ok) {
      throw new Error(
        responseJson.status === 'ERROR'
          ? responseJson.message
          : `Post request to ${url} failed with status ${response.status}.`
      );
    }

    return responseJson.content;
  });
}

export function swrPostRequest<R extends any, F extends Record<string, string>>(
  fn: typeof sendFormPostRequest<R, F>
) {
  return async (url: string, { arg }: { arg: F }) => {
    return fn(url, arg);
  };
}

export function swrPostRequestDefault() {
  return swrPostRequest(sendFormPostRequest);
}

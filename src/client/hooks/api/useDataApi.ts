import * as Sentry from '@sentry/react';
import axios, { AxiosRequestConfig, AxiosResponseTransformer } from 'axios';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { apiErrorResult } from '../../../universal/helpers/api';
import { Action } from '../../../universal/types';

export interface ApiRequestOptions extends AxiosRequestConfig {
  postpone?: boolean;
  sentryEnabled?: boolean;
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
  sentryEnabled: true,
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
      let source = axios.CancelToken.source();

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

          if (requestOptions.sentryEnabled) {
            if (!(error instanceof Error)) {
              Sentry.captureMessage(errorMessage, {
                extra: {
                  url: requestOptions.url?.split('?')[0],
                },
              });
            } else {
              Sentry.captureException(error, {
                extra: {
                  errorMessage,
                  url: requestOptions.url?.split('?')[0],
                },
              });
            }
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

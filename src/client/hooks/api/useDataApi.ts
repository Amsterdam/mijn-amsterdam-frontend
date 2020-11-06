import * as Sentry from '@sentry/browser';
import axios, { AxiosRequestConfig } from 'axios';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { apiErrorResult } from '../../../universal/helpers/api';
import { Action } from '../../../universal/types';
import { BFF_API_HEALTH_URL } from '../../config/api';

export interface ApiRequestOptions extends AxiosRequestConfig {
  postpone?: boolean;
}

const REQUEST_TIMEOUT = 20000; // 20seconds;
const MAX_POLL_COUNT = 5;
const POLL_INTERVAL_MS = 1000;

export const requestApiData = axios.create({
  responseType: 'json', // default
});

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
      setRequestOptions(options => ({
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

      const requestOptionsFinal = {
        ...DEFAULT_REQUEST_OPTIONS,
        ...requestOptions,
        cancelToken: source.token,
      };

      try {
        const result = await requestApiData(requestOptionsFinal);

        if (!didCancel) {
          dispatch({
            type: ActionTypes.FETCH_SUCCESS,
            payload: result.data || initialDataNoContent,
          });
        }
      } catch (error) {
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

      clearTimeout(requestTimeout);
    };

    if (requestOptions.postpone !== true && requestOptions.url !== '') {
      fetchData();
    }
    // When component is destroyed this callback is executed.
    return () => {
      didCancel = true;
    };
    // data passed here is used to compare if the effect should re-run.
    // See: https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  }, [requestOptions, initialDataNoContent]);

  return useMemo(() => {
    return [state, refetch];
  }, [state, refetch]);
}

export function pollBffHealth() {
  let pollCount = 0;
  console.info('Start polling for BFF health.');

  return new Promise((resolve, reject) => {
    function poll() {
      pollCount += 1;
      if (pollCount <= MAX_POLL_COUNT) {
        axios({ url: BFF_API_HEALTH_URL, responseType: 'json' })
          .then((response: { data: { status: 'OK' } | string }) => {
            if (
              typeof response.data !== 'string' &&
              response.data?.status === 'OK'
            ) {
              Sentry.captureMessage(
                `Polling for health succeeded after ${pollCount} tries.`
              );
              resolve();
            } else {
              Sentry.captureMessage(
                'Could not connect to server, BFF did not reply with response we expect.',
                {
                  extra: {
                    responseData: response.data,
                    pollCount,
                  },
                }
              );
              reject();
            }
          })
          .catch(error => {
            console.info('Request failed', pollCount, error.message);
            setTimeout(() => {
              poll();
            }, POLL_INTERVAL_MS);
          });
      } else {
        reject(
          'Could not connect to server, BFF not healthy max poll count reached.'
        );
      }
    }
    poll();
  });
}

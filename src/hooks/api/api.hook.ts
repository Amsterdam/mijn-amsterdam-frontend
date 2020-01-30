import * as Sentry from '@sentry/browser';
import { Action } from 'App.types';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { ApiRequestOptions, ApiState, RefetchFunction } from './api.types';

/**
 * Concepts in this hook are described in the following article:
 * https://www.robinwieruch.de/react-hooks-fetch-data/
 */

const ActionTypes = {
  FETCH_INIT: 'FETCH_INIT',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
};

function createApiDataReducer<T>(
  initialData: T,
  resetToInitialDataOnError: boolean = false
) {
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
          errorMessage: null,
        };
      case ActionTypes.FETCH_FAILURE:
        return {
          ...state,
          isLoading: false,
          isError: true,
          isPristine: false,
          isDirty: true,
          data: resetToInitialDataOnError ? initialData : state.data,
          errorMessage: action.payload,
        };
      default:
        throw new Error();
    }
  };
}

// The data api request options object
export const DEFAULT_REQUEST_OPTIONS: ApiRequestOptions = {
  // Url to data api endpoint
  url: '',
  // Request query params
  params: {},
  // Postpone fetch when hook is called/set-up for the first time
  postpone: false,
  // timeout in ms
  timeout: 10 * 1000,
};

export function getDefaultState<T>(initialData: T, postpone = false) {
  return {
    isLoading: postpone === true ? false : true,
    isError: false,
    isPristine: true,
    isDirty: false,
    data: initialData,
    errorMessage: null,
  };
}

export function useDataApi<T>(
  options: ApiRequestOptions = DEFAULT_REQUEST_OPTIONS,
  initialData: T
): [ApiState<T>, RefetchFunction] {
  const [requestOptions, setRequestOptions] = useState(options);
  const apiDataReducer = createApiDataReducer(initialData, true);

  const refetch = useCallback(
    (refetchOptions: Partial<ApiRequestOptions>) => {
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
    getDefaultState<T>(initialData, requestOptions.postpone)
  );

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({
        type: ActionTypes.FETCH_INIT,
      });

      try {
        const result = await axios({
          ...DEFAULT_REQUEST_OPTIONS,
          ...requestOptions,
        });

        if (!didCancel) {
          dispatch({
            type: ActionTypes.FETCH_SUCCESS,
            payload: result.data,
          });
        }
      } catch (error) {
        if (!didCancel) {
          const errorMessage = error.response?.data.message || error.message;
          dispatch({
            type: ActionTypes.FETCH_FAILURE,
            payload: errorMessage,
          });
          Sentry.captureMessage(
            `API ERROR: ${errorMessage}, url: ${
              requestOptions.url.split('?')[0] // Don't log query params for privacy reasons
            }`
          );
        }
      }
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
  }, [requestOptions]);

  return useMemo(() => {
    return [state, refetch];
  }, [state, refetch]);
}

import { Action, Unshaped } from 'App.types';
import axios from 'axios';
import { useEffect, useReducer, useState } from 'react';
import {
  AbortFunction,
  ApiRequestOptions,
  ApiState,
  RefetchFunction,
} from './api.types';

/**
 * Concepts in this hook are described in the following article:
 * https://www.robinwieruch.de/react-hooks-fetch-data/
 */

const ActionTypes = {
  FETCH_INIT: 'FETCH_INIT',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
};

const createApiDataReducer = (
  initialData: Unshaped = {},
  resetToInitialDataOnError: boolean = false
) => (state: ApiState, action: Action): ApiState => {
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

export const getDefaultState = (initialData = {}, postpone = false) => ({
  isLoading: postpone === true ? false : true,
  isError: false,
  isPristine: true,
  isDirty: false,
  data: initialData,
  errorMessage: null,
});

export const useDataApi = (
  options: ApiRequestOptions = DEFAULT_REQUEST_OPTIONS,
  initialData: Unshaped = {}
): [ApiState, RefetchFunction, AbortFunction] => {
  const [requestOptions, setRequestOptions] = useState(options);
  const apiDataReducer = createApiDataReducer(initialData, true);
  const refetch = (options: ApiRequestOptions) => {
    setRequestOptions({ ...options, postpone: false });
  };

  const [state, dispatch] = useReducer(
    apiDataReducer,
    getDefaultState(initialData, requestOptions.postpone)
  );

  function abort() {
    dispatch({
      type: ActionTypes.FETCH_FAILURE,
      payload: 'Request aborted',
    });
  }

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
      } catch (result) {
        if (!didCancel) {
          dispatch({
            type: ActionTypes.FETCH_FAILURE,
            payload: result.message,
          });
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

  return [state, refetch, abort];
};

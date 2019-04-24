import { useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Unshaped, Action } from 'App.types';
import { ApiRequestOptions, ApiState } from './api.types';

/**
 * Concepts in this hook are described in the following article:
 * https://www.robinwieruch.de/react-hooks-fetch-data/
 */

const ActionTypes = {
  FETCH_INIT: 'FETCH_INIT',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
};

const createApiDataReducer = (initialData: Unshaped = {}) => (
  state: ApiState,
  action: Action
): ApiState => {
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
        data: initialData,
      };
    default:
      throw new Error();
  }
};

// The data api request options object
const DEFAULT_REQUEST_OPTIONS: ApiRequestOptions = {
  // Url to data api endpoint
  url: '',
  // Request query params
  params: {},
  // Postpone fetch when hook is called/set-up for the first time
  postpone: false,
};

export const useDataApi = (
  options: ApiRequestOptions = DEFAULT_REQUEST_OPTIONS,
  initialData: Unshaped = {}
) => {
  const [requestOptions, setRequestOptions] = useState(options);
  const apiDataReducer = createApiDataReducer(initialData);

  const [state, dispatch] = useReducer(apiDataReducer, {
    isLoading: options.postpone === true ? false : true,
    isError: false,
    isPristine: true,
    isDirty: false,
    data: initialData,
    refetch: (options: ApiRequestOptions) => {
      setRequestOptions({ ...options, postpone: false });
    },
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({
        type: ActionTypes.FETCH_INIT,
      });

      try {
        const result = await axios(requestOptions);

        if (!didCancel) {
          dispatch({
            type: ActionTypes.FETCH_SUCCESS,
            payload: result.data,
          });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({
            type: ActionTypes.FETCH_FAILURE,
          });
        }
      }
    };

    if (requestOptions.postpone !== true) {
      fetchData();
    }
    // When component is destroyed this callback is executed.
    return () => {
      didCancel = true;
    };
    // data passed here is used to compare if the effect should re-run.
    // See: https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  }, [requestOptions]);

  return state;
};

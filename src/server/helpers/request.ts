import { ApiErrorResponse, ApiSuccesResponse } from '../../universal/config';
import axios, {
  AxiosError,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { capitalizeFirstLetter } from '../../universal/helpers/text';
import { entries } from '../../universal/helpers/utils';
import { mockDataConfig } from '../mock-data/index';

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios);

  entries(mockDataConfig).forEach(
    ([url, { status, responseData, method = 'get' }]) => {
      const onMethod = `on${capitalizeFirstLetter(method)}`;
      mock[onMethod](url).reply(
        status,
        typeof responseData === 'function' ? responseData() : responseData
      );
    }
  );
}

function handleRequestError(error: AxiosError) {
  console.log('handleRequestError', error);
}

export function requestSourceData<T>(
  config: AxiosRequestConfig
): AxiosPromise<T> {
  if (process.env.NODE_ENV !== 'production') {
    enableMockAdapter();
  }

  const request = axios(config);
  request.catch(handleRequestError);
  return request;
}

function apiErrorResult(reason: string): ApiErrorResponse {
  return {
    message: reason,
    status: 'failure',
    statusCode: 500,
  };
}

function apiSuccesResult<T>(content: T): ApiSuccesResponse<T> {
  return {
    content,
    status: 'success',
    statusCode: 200,
  };
}

export function getResultFromSettledPromise<T>(
  promiseResult: PromiseSettledResult<AxiosResponse<T>>
): ApiSuccesResponse<T> | ApiErrorResponse {
  return promiseResult.status === 'fulfilled'
    ? apiSuccesResult<T>(promiseResult.value.data)
    : apiErrorResult(promiseResult.reason);
}

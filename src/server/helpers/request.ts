import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { capitalizeFirstLetter } from '../../universal/helpers/text';
import { entries } from '../../universal/helpers/utils';
import { mockDataConfig, resolveWithDelay } from '../mock-data/index';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../universal/helpers/api';
import { Deferred } from './deferred';
import {
  apiSuccesResult,
  apiErrorResult,
  apiPostponeResult,
} from '../../universal/helpers';
// import { IS_SENTRY_ENABLED, BFF_SENTRY_DSN, ENV } from '../../universal/env';
// import * as Sentry from '@sentry/node';

// if (BFF_SENTRY_DSN && IS_SENTRY_ENABLED) {
//   Sentry.init({
//     dsn: BFF_SENTRY_DSN,
//     environment: ENV,
//   });
// }

const DEFAULT_REQUEST_CONFIG: AxiosRequestConfig & { cancelTimeout: number } = {
  cancelTimeout: 20000, // 20 seconds
};

const requestTApiData = axios.create({
  responseType: 'json',
});

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(requestTApiData);

  entries(mockDataConfig).forEach(
    async ([
      url,
      { status, responseData, method = 'get', networkError, delay },
    ]) => {
      const onMethod = `on${capitalizeFirstLetter(method)}`;
      const req = mock[onMethod](url);
      if (networkError) {
        req.networkError();
      } else {
        req.reply(async (...args: any[]) => {
          const data = await resolveWithDelay(
            delay,
            await responseData(...args)
          );
          return [status, data];
        });
      }
    }
  );
}

if (process.env.REACT_APP_ENV !== 'production') {
  enableMockAdapter();
}

export interface RequestConfig<Source, Transformed> {
  url: string;
  format: (data: Source) => Transformed;
}

export const cache = new Map();

export function clearCache(sessionID: SessionID) {
  for (const cacheKey of cache.keys()) {
    if (cacheKey.startsWith(sessionID)) {
      cache.delete(cacheKey);
    }
  }
}

export async function requestData<T>(
  config: AxiosRequestConfig,
  sessionID: SessionID = 'testje',
  postpone: boolean = false
) {
  if (postpone) {
    return apiPostponeResult();
  }

  const source = axios.CancelToken.source();

  const requestConfig = {
    ...DEFAULT_REQUEST_CONFIG,
    ...config,
    cancelToken: source.token,
  };

  const cacheKey =
    sessionID +
    requestConfig.url +
    (requestConfig.params ? JSON.stringify(requestConfig.params) : '');

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey).promise as Promise<
      ApiSuccessResponse<T> | ApiErrorResponse<null>
    >;
  }

  if (requestConfig.method?.toLowerCase() === 'get') {
    cache.set(cacheKey, new Deferred<ApiSuccessResponse<T>>());
  }

  try {
    // Request is cancelled after x ms
    setTimeout(() => {
      source.cancel('Request to source api timeout.');
    }, requestConfig.cancelTimeout);

    const request: AxiosPromise<T> = requestTApiData(requestConfig);
    const response: AxiosResponse<T> = await request;
    const responseData = apiSuccesResult<T>(response.data);

    if (requestConfig.method?.toLowerCase() === 'get') {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error) {
    console.log('ERROR', error);
    // IS_SENTRY_ENABLED && Sentry.captureException(error);

    const responseData = apiErrorResult(error, null);

    if (requestConfig.method?.toLowerCase() === 'get') {
      cache.get(cacheKey).resolve(responseData);
      // Don't cache the errors
      cache.delete(cacheKey);
    }

    return responseData;
  }
}

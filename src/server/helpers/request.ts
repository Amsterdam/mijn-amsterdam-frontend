import * as Sentry from '@sentry/node';
import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV, getOtapEnvItem, IS_AP } from '../../universal/config/env';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccesResult,
} from '../../universal/helpers';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../universal/helpers/text';
import { entries } from '../../universal/helpers/utils';
import { mockDataConfig, resolveWithDelay } from '../mock-data/index';
import { Deferred } from './deferred';
import memoryCache from 'memory-cache';

if (getOtapEnvItem('bffSentryDsn')) {
  Sentry.init({
    dsn: getOtapEnvItem('bffSentryDsn'),
    environment: ENV,
  });
}

const CACHE_KEEP_MAX_MS = 60 * 1000; // 1 minute. We expect that all requests will resolve within this total timeframe.

const DEFAULT_REQUEST_CONFIG: AxiosRequestConfig & { cancelTimeout: number } = {
  cancelTimeout: 20000, // 20 seconds
  method: 'get',
};

export const axiosRequest = axios.create({
  responseType: 'json',
});

export const cache = new memoryCache.Cache<string, any>();

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axiosRequest);

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

if (!IS_AP && !process.env.BFF_DISABLE_MOCK_ADAPTER) {
  console.info('Axios Mock adapter enabled');
  enableMockAdapter();
}

export interface RequestConfig<Source, Transformed> {
  url: string;
  format: (data: Source) => Transformed;
}

export function clearCache(sessionID: SessionID) {
  for (const cacheKey of cache.keys()) {
    if (cacheKey.startsWith(sessionID)) {
      cache.del(cacheKey);
    }
  }
}

export async function requestData<T>(
  config: AxiosRequestConfig,
  sessionID: SessionID,
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

  const isGetRequest = requestConfig.method?.toLowerCase() === 'get';

  // Construct a cache key based on unique properties of a request
  const cacheKey = [
    sessionID,
    requestConfig.method,
    requestConfig.url,
    requestConfig.params ? JSON.stringify(requestConfig.params) : 'no-params',
  ].join('-');

  // Check if a cache key for this particular request exists
  const cacheEntry = cache.get(cacheKey);

  if (cacheEntry !== null) {
    return cacheEntry.promise as Promise<
      ApiSuccessResponse<T> | ApiErrorResponse<null>
    >;
  }

  // Set the cache Deferred
  if (isGetRequest) {
    cache.put(
      cacheKey,
      new Deferred<ApiSuccessResponse<T>>(),
      CACHE_KEEP_MAX_MS
    );
  }

  try {
    // Request is cancelled after x ms
    setTimeout(() => {
      source.cancel('Request to source api timeout.');
    }, requestConfig.cancelTimeout);

    const request: AxiosPromise<T> = axiosRequest(requestConfig);
    const response: AxiosResponse<T> = await request;
    const responseData = apiSuccesResult<T>(response.data);

    // Use the cache Deferred for resolving the response
    if (isGetRequest) {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error) {
    getOtapEnvItem('sentryDsn') && Sentry.captureException(error);

    const responseData = apiErrorResult(error, null);

    if (isGetRequest) {
      // Resolve with error
      cache.get(cacheKey).resolve(responseData);
      // Don't cache the errors
      cache.del(cacheKey);
    }

    return responseData;
  }
}

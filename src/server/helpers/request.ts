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

if (getOtapEnvItem('bffSentryDsn')) {
  Sentry.init({
    dsn: getOtapEnvItem('bffSentryDsn'),
    environment: ENV,
  });
}

const DEFAULT_REQUEST_CONFIG: AxiosRequestConfig & { cancelTimeout: number } = {
  cancelTimeout: 20000, // 20 seconds
};

export const axiosRequest = axios.create({
  responseType: 'json',
});

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

    const request: AxiosPromise<T> = axiosRequest(requestConfig);
    const response: AxiosResponse<T> = await request;
    const responseData = apiSuccesResult<T>(response.data);

    if (requestConfig.method?.toLowerCase() === 'get') {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error) {
    getOtapEnvItem('sentryDsn') && Sentry.captureException(error);

    const responseData = apiErrorResult(error, null);

    if (requestConfig.method?.toLowerCase() === 'get') {
      cache.get(cacheKey).resolve(responseData);
      // Don't cache the errors
      cache.delete(cacheKey);
    }

    return responseData;
  }
}

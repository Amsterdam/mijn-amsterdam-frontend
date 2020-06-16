import * as Sentry from '@sentry/node';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { Request } from 'express';
import memoryCache from 'memory-cache';
import { IS_AP } from '../../universal/config/env';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccesResult,
  capitalizeFirstLetter,
  entries,
} from '../../universal/helpers';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../universal/helpers/api';
import {
  BFF_MS_API_BASE_URL,
  BFF_REQUEST_CACHE_ENABLED,
  DataRequestConfig,
  TMA_SAML_HEADER,
  DEFAULT_REQUEST_CONFIG,
} from '../config';
import { mockDataConfig, resolveWithDelay } from '../mock-data/index';
import { Deferred } from './deferred';

export const axiosRequest = axios.create({
  responseType: 'json',
});

export const cache = new memoryCache.Cache<string, any>();

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axiosRequest, { onNoMatch: 'passthrough' });

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

export function clearSessionCache(sessionID: SessionID) {
  for (const cacheKey of cache.keys()) {
    if (cacheKey.startsWith(sessionID)) {
      cache.del(cacheKey);
    }
  }
}

export async function requestData<T>(
  config: DataRequestConfig,
  sessionID: SessionID,
  samlToken: string
) {
  const source = axios.CancelToken.source();

  const requestConfig: DataRequestConfig = {
    ...DEFAULT_REQUEST_CONFIG,
    ...config,
    cancelToken: source.token,
  };

  if (requestConfig.postponeFetch) {
    return apiPostponeResult();
  }

  if (requestConfig.transformResponse) {
    requestConfig.transformResponse = [].concat(
      axios.defaults.transformResponse as any,
      requestConfig.transformResponse as any
    );
  }

  if (requestConfig.url?.startsWith(BFF_MS_API_BASE_URL) && samlToken) {
    if (!requestConfig.headers) {
      requestConfig.headers = {};
    }
    requestConfig.headers[TMA_SAML_HEADER] = samlToken;
  }

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

  if (BFF_REQUEST_CACHE_ENABLED && cacheEntry !== null) {
    return cacheEntry.promise as Promise<
      ApiSuccessResponse<T> | ApiErrorResponse<null>
    >;
  }

  // Set the cache Deferred
  if (isGetRequest) {
    cache.put(
      cacheKey,
      new Deferred<ApiSuccessResponse<T>>(),
      requestConfig.cacheTimeout
    );
  }

  try {
    // Request is cancelled after x ms
    setTimeout(() => {
      source.cancel('Request to source api timeout.');
    }, requestConfig.cancelTimeout!);

    const request: AxiosPromise<T> = axiosRequest(requestConfig);
    const response: AxiosResponse<T> = await request;
    const responseData = apiSuccesResult<T>(response.data);

    // Use the cache Deferred for resolving the response
    if (isGetRequest && cache.get(cacheKey)) {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error) {
    if (isGetRequest) {
      // We're returning a result here so a failed request will not prevent other succeeded request needed for a response
      // to the client to pass through.
      const sentryId = error.isAxiosError
        ? Sentry.captureMessage(error?.message ? error.message : error, {
            tags: {
              url: requestConfig.url!,
            },
            extra: {
              module: 'request',
              status: error?.response?.status,
            },
          })
        : Sentry.captureException(error, {
            tags: {
              url: requestConfig.url!,
            },
          });

      const responseData = apiErrorResult(
        error?.response?.data?.message || error.toString(),
        null,
        sentryId
      );

      if (cache.get(cacheKey)) {
        // Resolve with error
        cache.get(cacheKey).resolve(responseData);
        // Don't cache the errors
        cache.del(cacheKey);
      }

      return responseData;
    }

    throw error;
  }
}

export function getSamlTokenHeader(req: Request) {
  return (req.headers[TMA_SAML_HEADER] || '') as string;
}

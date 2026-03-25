import type { AxiosError, AxiosRequestConfig } from 'axios';
import { type AxiosResponseHeaders } from 'axios';
import axios, { isAxiosError } from 'axios';
import memoryCache from 'memory-cache';

import {
  addRequestDataDebugging,
  addResponseDataDebugging,
} from './source-api-debug.ts';
import { getRequestConfigCacheKey } from './source-api-helpers.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../universal/helpers/api.ts';
import { omit } from '../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../auth/auth-types.ts';
import type {
  ApiUrlEntries,
  DataRequestConfig,
  DataRequestResponseTransformer,
} from '../config/source-api.ts';
import {
  DATA_REQUEST_CONFIG_BASE_KEYS,
  DEFAULT_CANCEL_TIMEOUT_MS,
  DEFAULT_REQUEST_CACHE_TTL_MS,
  DEFAULT_REQUEST_CONFIG,
  FORCE_RENEW_CACHE_TTL_MS,
} from '../config/source-api.ts';
import { debugCacheKey, debugResponse, debugResponseError } from '../debug.ts';
import { captureException } from '../services/monitoring.ts';

const useDescriptiveErrorMessages =
  !IS_PRODUCTION && MA_APP_MODE !== 'unittest';

export const axiosRequest = axios.create({
  responseType: 'json',
  headers: { 'User-Agent': 'mijn-amsterdam-bff' },
});

export function isSuccessStatus(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new memoryCache.Cache<string, any>();

export function deleteCacheEntry(cacheKey: string) {
  const success = cache.del(cacheKey);
  if (success) {
    debugCacheKey(`Cache entry deleted for ${cacheKey}`);
  } else {
    debugCacheKey(`No cache entry found for ${cacheKey}`);
  }
  return success;
}

export interface RequestConfig<Source, Transformed> {
  url: string;
  format: (data: Source) => Transformed;
}

async function request({
  cancelTimeout,
  request,
  ...config
}: AxiosRequestConfig & {
  cancelTimeout: number;
  request?: DataRequestConfig['request'];
}) {
  const source = axios.CancelToken.source();
  // Request is cancelled after x ms
  const cancelTimeoutId = setTimeout(() => {
    source.cancel('Request to source api timeout.');
  }, cancelTimeout);

  const doRequest = request || axiosRequest.request;

  return doRequest({ ...config, cancelToken: source.token }).then(
    (response) => {
      clearTimeout(cancelTimeoutId);
      return response;
    },
    (error) => {
      clearTimeout(cancelTimeoutId);
      throw error;
    }
  );
}

export async function requestData<T>(
  requestConfig: DataRequestConfig,
  authProfileAndToken?: AuthProfileAndToken
): Promise<ApiResponse<T>> {
  const config: DataRequestConfig = {
    ...DEFAULT_REQUEST_CONFIG,
    ...requestConfig,
  };

  if (config.postponeFetch) {
    return apiPostponeResult(null);
  }

  // Collect response transformers, if any are configured, and remove them from the config passed to axios.
  // We don't want to cache the transformed response, only the original response from the source api.
  const transformers: DataRequestResponseTransformer[] = [];

  if (config.transformResponse) {
    if (Array.isArray(config.transformResponse)) {
      transformers.push(...config.transformResponse);
    } else {
      transformers.push(config.transformResponse);
    }
    delete config.transformResponse;
  }

  const axiosRequestConfig: AxiosRequestConfig = omit(
    config,
    DATA_REQUEST_CONFIG_BASE_KEYS
  );

  // Add debugging transformers based on environment variables
  // These transformers will log the raw response data and request config for requests that match certain terms defined in environment variables.
  // These calls will be cached along with the original request, but since they only log the data and don't modify it, this should not affect the caching behavior.
  addResponseDataDebugging(axiosRequestConfig);
  addRequestDataDebugging(axiosRequestConfig);

  // Shortcut to passing the JWT of the connected OIDC provider along with the request as Bearer token
  // A configured Authorization header passed via { ... headers: { Authorization: 'xxx' }, ... } takes presedence.
  if (config.passthroughOIDCToken && authProfileAndToken?.token) {
    const headers = axiosRequestConfig?.headers ?? {};
    axiosRequestConfig.headers = Object.assign(
      {
        Authorization: `Bearer ${authProfileAndToken.token}`,
      },
      headers
    );
  }

  // Construct a cache key based on unique properties of a request
  const cacheKey = config.cacheKey_UNSAFE || getRequestConfigCacheKey(config);

  // Check if a cache key for this particular request exists
  const cachedRequestPromise = cache.get(cacheKey) as ReturnType<
    typeof request
  > | null;

  const cacheTimeout = config.cacheTimeout ?? DEFAULT_REQUEST_CACHE_TTL_MS;
  const shouldRenewCache = cacheTimeout === FORCE_RENEW_CACHE_TTL_MS;
  const shouldUseCache = config.enableCache !== false;

  if (cachedRequestPromise && shouldRenewCache) {
    cache.del(cacheKey);
  }

  const requestPromise =
    !shouldRenewCache && shouldUseCache && cachedRequestPromise
      ? cachedRequestPromise
      : request({
          ...axiosRequestConfig,
          cancelTimeout: config.cancelTimeout ?? DEFAULT_CANCEL_TIMEOUT_MS,
          request: config.request,
        });

  const isServedFromCache = cache.get(cacheKey) === requestPromise;

  if (shouldUseCache && !isServedFromCache && cacheTimeout > 0) {
    cache.put(cacheKey, requestPromise, cacheTimeout);
  }

  try {
    const response = await requestPromise;

    let responseDataTransformed = response.data;

    if (transformers.length > 0) {
      responseDataTransformed = transformers.reduce((data, transformer) => {
        return transformer(data, response.headers, response.status);
      }, responseDataTransformed);
    }
    return apiSuccessResult(responseDataTransformed as T);
  } catch (error_) {
    // Delete the cache asap, we don't want to serve a cached error response on the next request.
    cache.del(cacheKey);

    const fromAxios = isAxiosError(error_);

    let code: number = 500;
    let errorMessage: string = '';
    let stack: string | undefined = undefined;

    if (fromAxios) {
      const error = error_ as AxiosError;
      code = error.status ?? error?.response?.status ?? code;
      errorMessage = useDescriptiveErrorMessages
        ? `AxiosError in requestData: ${error.message} for URL ${config.url}`
        : error.message;
      stack = error.stack;
    } else {
      const error = error_ as Error;
      errorMessage = useDescriptiveErrorMessages
        ? `Error in requestData: ${error.message} for URL ${config.url}`
        : error.message;
      stack = error.stack;
    }

    debugResponse('[ERROR]: %s', errorMessage, config.url);
    debugResponseError('[ERROR]: %o', error_);

    const e = new Error(errorMessage);
    e.stack = stack;

    captureException(e);

    return apiErrorResult(errorMessage, null, code);
  }
}

export function findApiByRequestUrl(
  apiUrlEntries: ApiUrlEntries,
  requestUrl?: string
) {
  const api = apiUrlEntries.find(([_apiName, url]) => {
    if (typeof url === 'object') {
      return Object.entries(url as object).some(([_profileType, url]) =>
        requestUrl?.startsWith(url)
      );
    }
    return requestUrl?.startsWith(url);
  });
  const apiName = api ? api[0] : 'unknown';
  return apiName;
}

export function getNextUrlFromLinkHeader(headers: AxiosResponseHeaders) {
  // parse link header and get value of rel="next" url
  const links = headers.link.split(',');
  const next = links.find(
    (link: string) => link.includes('rel="next"') && link.includes(';')
  );

  if (!next) {
    return null;
  }

  const rawUrl = next.split(';')[0].trim();
  const strippedUrl = rawUrl.substring(1, rawUrl.length - 1); // The link values should according to spec be wrapped in <> so we need to strip those.
  return new URL(strippedUrl);
}

export function getRequestParamsFromQueryString(queryString: string) {
  return Object.fromEntries(new URLSearchParams(queryString));
}

export const forTesting = {
  cache,
};

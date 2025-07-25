import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosResponseHeaders,
  type AxiosResponseTransformer,
} from 'axios';
import createDebugger from 'debug';
import memoryCache from 'memory-cache';

import { Deferred } from './deferred';
import { getRequestConfigCacheKey } from './source-api-helpers';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../auth/auth-types';
import {
  ApiUrlEntries,
  DEFAULT_REQUEST_CONFIG,
  DataRequestConfig,
} from '../config/source-api';
import { captureException } from '../services/monitoring';

const debugRequest = createDebugger('source-api-request:request');
const debugCacheHit = createDebugger('source-api-request:cache-hit');
const debugCacheKey = createDebugger('source-api-request:cache-key');

export const axiosRequest = axios.create({
  responseType: 'json',
  headers: { 'User-Agent': 'mijn-amsterdam-bff' },
});

export function isSuccessStatus(statusCode: number): boolean {
  // eslint-disable-next-line no-magic-numbers
  return statusCode >= 200 && statusCode < 300;
}

function getDebugResponseData(conf: AxiosRequestConfig) {
  return (responseDataParsed: any) => {
    debugRequest(
      {
        url: conf.url,
        params: conf.params,
      },
      'start:debug response data'
    );
    debugRequest(responseDataParsed, 'end:debug response data');
    return responseDataParsed;
  };
}

const debugResponseDataTerms =
  process.env.DEBUG_RESPONSE_DATA?.split(',') ?? [];

debugRequest(debugResponseDataTerms, 'debug response data terms');

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

export async function requestData<T>(
  passConfig: DataRequestConfig,
  authProfileAndToken?: AuthProfileAndToken
) {
  const source = axios.CancelToken.source();

  const config = {
    ...DEFAULT_REQUEST_CONFIG,
    ...passConfig,
    cancelToken: source.token,
  };

  if (config.postponeFetch) {
    return apiPostponeResult(null);
  }

  if (config.transformResponse) {
    const transformers: AxiosResponseTransformer[] = [];
    config.transformResponse = transformers.concat(
      axios.defaults.transformResponse ?? [],
      config.transformResponse ?? []
    );
  }

  const debugResponseData = getDebugResponseData(config);
  // Log/Debug the untransformed response data
  if (
    debugResponseDataTerms.filter(Boolean).some((term) => {
      const hasTermInRequestUrl = !!config.url?.includes(term.trim());
      const hasTermInRequestParams = config.params
        ? JSON.stringify(config.params).includes(term.trim())
        : false;
      const isDebugTermMatch = hasTermInRequestUrl || hasTermInRequestParams;

      if (isDebugTermMatch) {
        debugRequest(
          {
            term,
            hasTermInRequestParams,
            hasTermInRequestUrl,
            url: config.url,
            params: config.params,
          },
          'debug response data term match'
        );
      }

      return isDebugTermMatch;
    }) &&
    !config.transformResponse?.includes(debugResponseData)
  ) {
    // Add default transformer if no transformers are defined
    if (!config.transformResponse) {
      const transformers: AxiosResponseTransformer[] = [];
      config.transformResponse = transformers.concat(
        axios.defaults.transformResponse ?? []
      );
    }
    // Insert the debug transformer after the default transformer
    // This is important to ensure that the response is parsed before we log it.
    config.transformResponse.splice(1, 0, debugResponseData);
  }

  // Shortcut to passing the JWT of the connected OIDC provider along with the request as Bearer token
  // A configured Authorization header passed via { ... headers: { Authorization: 'xxx' }, ... } takes presedence.
  if (config.passthroughOIDCToken && authProfileAndToken?.token) {
    const headers = config?.headers ?? {};
    config.headers = Object.assign(
      {
        Authorization: `Bearer ${authProfileAndToken.token}`,
      },
      headers
    );
  }

  // Construct a cache key based on unique properties of a request
  const cacheKey = config.cacheKey_UNSAFE || getRequestConfigCacheKey(config);

  // Check if a cache key for this particular request exists
  const cacheEntry = cache.get(cacheKey);

  if (config.enableCache && cacheEntry !== null) {
    debugCacheHit(`Cache hit! ${config.url}`);
    return cacheEntry.promise as Promise<
      ApiSuccessResponse<T> | ApiErrorResponse<null>
    >;
  }

  // Set the cache Deferred
  if (
    config.enableCache &&
    cacheKey &&
    !!config.cacheTimeout &&
    config.cacheTimeout > 0
  ) {
    // Debug the cache key to check if the cache key is set and uses the custom cache key if provided.
    debugCacheKey(
      `Caching ${config.url}${config.cacheKey_UNSAFE ? ` with custom cachekey ${config.cacheKey_UNSAFE}` : ''}, releases in ${config.cacheTimeout}ms`
    );
    cache.put(
      cacheKey,
      new Deferred<ApiSuccessResponse<T>>(),
      config.cacheTimeout
    );
  }

  let cancelTimeout;

  try {
    // Request is cancelled after x ms
    cancelTimeout = setTimeout(() => {
      source.cancel('Request to source api timeout.');
    }, config.cancelTimeout!);

    let response: AxiosResponse<T>;

    if (config.request) {
      response = await config.request<T>(config);
    } else {
      response = await axiosRequest.request<T>(config);
    }

    // Clears the timeout after the above request promise is settled
    clearTimeout(cancelTimeout);

    const responseData = apiSuccessResult<T>(response.data);

    // Use the cached Deferred for resolving the response
    if (config.enableCache && cache.get(cacheKey)) {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error: any) {
    const errorMessage = 'message' in error ? error.message : error.toString();

    debugRequest(error, config.url, 'response error');

    captureException(error, {
      properties: {
        message: errorMessage,
      },
    });

    const statusCode = error.statusCode ?? error?.response?.status;
    const responseData = apiErrorResult(
      errorMessage,
      null,
      statusCode ? parseInt(statusCode, 10) : undefined
    );

    if (cache.get(cacheKey)) {
      // Resolve with error
      cache.get(cacheKey).resolve(responseData);
      // Remove entry from cache
      cache.del(cacheKey);
    }

    return responseData;
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

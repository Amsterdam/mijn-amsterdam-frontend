import axios, { AxiosResponse, AxiosResponseHeaders } from 'axios';
import memoryCache from 'memory-cache';

import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiResponse,
  ApiSuccessResponse,
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../auth/auth-types';
import { BFF_REQUEST_CACHE_ENABLED } from '../config/app';
import {
  ApiUrlEntries,
  DEFAULT_REQUEST_CONFIG,
  DataRequestConfig,
} from '../config/source-api';
import { captureException } from '../services/monitoring';
import { Deferred } from './deferred';

export const axiosRequest = axios.create({
  responseType: 'json',
  headers: { 'User-Agent': 'mijn-amsterdam-bff' },
});

function debugResponseData(responseData: any) {
  console.debug('\n\nResponse:\n');
  console.debug(responseData || '<== NO RESPONSE DATA ==>');
  console.debug('\nEnd response from');
  return responseData;
}

const debugResponseDataTerms = process.env.DEBUG_RESPONSE_DATA?.split(',');

// Log response url after debugging the response data because the debugTransformer doesn't have access to the url
// and interceptors cannot log untransformed response data.
if (debugResponseDataTerms?.length) {
  axiosRequest.interceptors.response.use((response) => {
    if (
      debugResponseDataTerms.some((term) => {
        return !!term && response.config.url?.includes(term.trim());
      })
    ) {
      console.debug(
        'url:',
        response.request?.res?.responseUrl ?? response.config.url,
        '\n\n'
      );
    }
    return response;
  });
}

export const cache = new memoryCache.Cache<string, any>();

export interface RequestConfig<Source, Transformed> {
  url: string;
  format: (data: Source) => Transformed;
}

export function clearSessionCache(requestID: RequestID) {
  for (const cacheKey of cache.keys()) {
    if (cacheKey.startsWith(requestID)) {
      cache.del(cacheKey);
    }
  }
}

export function getRequestConfigCacheKey(
  requestID: string,
  requestConfig: DataRequestConfig
) {
  return [
    requestID,
    requestConfig.method,
    requestConfig.url,
    requestConfig.params ? JSON.stringify(requestConfig.params) : 'no-params',
    requestConfig.data ? JSON.stringify(requestConfig.data) : 'no-data',
    requestConfig.headers
      ? JSON.stringify(requestConfig.headers)
      : 'no-headers',
  ].join('-');
}

export async function requestData<T>(
  config: DataRequestConfig,
  requestID: RequestID,
  authProfileAndToken?: AuthProfileAndToken
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

  // Log/Debug the untransformed response data
  if (
    debugResponseDataTerms?.some((term) => {
      return !!term && requestConfig.url?.includes(term.trim());
    }) &&
    !requestConfig.transformResponse?.includes(debugResponseData)
  ) {
    // Add default transformer if no transformers are defined
    if (!requestConfig.transformResponse) {
      requestConfig.transformResponse = [].concat(
        axios.defaults.transformResponse as any
      );
    }
    // Add the debug transformer as first transformer
    requestConfig.transformResponse.unshift(debugResponseData);
  }

  // Shortcut to passing the JWT of the connected OIDC provider along with the request as Bearer token
  // A configured Authorization header passed via { ... headers: { Authorization: 'xxx' }, ... } takes presedence.
  if (requestConfig.passthroughOIDCToken && authProfileAndToken?.token) {
    const headers = requestConfig?.headers ?? {};
    requestConfig.headers = Object.assign(
      {
        Authorization: `Bearer ${authProfileAndToken.token}`,
      },
      headers
    );
  }

  // Construct a cache key based on unique properties of a request
  const cacheKey =
    requestConfig.cacheKey ||
    getRequestConfigCacheKey(requestID, requestConfig);

  // Check if a cache key for this particular request exists
  const cacheEntry = cache.get(cacheKey);

  if (BFF_REQUEST_CACHE_ENABLED && cacheEntry !== null) {
    return cacheEntry.promise as Promise<
      ApiSuccessResponse<T> | ApiErrorResponse<null>
    >;
  }

  // Set the cache Deferred
  if (
    BFF_REQUEST_CACHE_ENABLED &&
    cacheKey &&
    !!requestConfig.cacheTimeout &&
    requestConfig.cacheTimeout > 0
  ) {
    cache.put(
      cacheKey,
      new Deferred<ApiSuccessResponse<T>>(),
      requestConfig.cacheTimeout
    );
  }

  let cancelTimeout;

  try {
    // Request is cancelled after x ms
    cancelTimeout = setTimeout(() => {
      source.cancel('Request to source api timeout.');
    }, requestConfig.cancelTimeout!);

    let response: AxiosResponse<T>;

    if (requestConfig.request) {
      response = await requestConfig.request<T>(requestConfig);
    } else {
      response = await axiosRequest.request<T>(requestConfig);
    }

    // Clears the timeout after the above request promise is settled
    clearTimeout(cancelTimeout);

    const responseData = apiSuccessResult<T>(response.data);

    // Use the cache Deferred for resolving the response
    if (BFF_REQUEST_CACHE_ENABLED && cache.get(cacheKey)) {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error: any) {
    const errorMessage = 'message' in error ? error.message : error.toString();

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

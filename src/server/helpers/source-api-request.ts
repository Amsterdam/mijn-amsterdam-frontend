import axios, { AxiosResponse, AxiosResponseHeaders } from 'axios';
import memoryCache from 'memory-cache';
import { IS_TAP } from '../../universal/config/env';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
  capitalizeFirstLetter,
  entries,
} from '../../universal/helpers';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../universal/helpers/api';
import {
  ApiUrlEntries,
  BFF_REQUEST_CACHE_ENABLED,
  DEFAULT_REQUEST_CONFIG,
  DataRequestConfig,
  IS_DEBUG,
  apiUrlEntries,
} from '../config';
import { mockDataConfig, resolveWithDelay } from '../mock-data/index';
import { captureException, captureMessage } from '../services/monitoring';
import { AuthProfileAndToken } from './app';
import { Deferred } from './deferred';

export const axiosRequest = axios.create({
  responseType: 'json',
  headers: { 'User-Agent': 'mijn-amsterdam-bff' },
});

if (IS_DEBUG) {
  axiosRequest.interceptors.request.use((request) => {
    console.log(
      'Source-api-request::Request:',
      request.url,
      request.params,
      request.headers
    );
    return request;
  });

  axiosRequest.interceptors.response.use((response) => {
    console.log(
      'Source-api-request::Response:',
      response.request.res?.responseUrl ??
      response.request?.responseURL ??
      'onbekende.url'
    );
    return response;
  });
}

export const cache = new memoryCache.Cache<string, any>();

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance, let unmatched request passthrough to the requested urls.
  const mock = new MockAdapter(axiosRequest, { onNoMatch: 'passthrough' });

  entries(mockDataConfig).forEach(async ([url, config]) => {
    if (!Array.isArray(config)) {
      config = [config];
    }

    config.forEach(
      ({
        status,
        responseData,
        method = 'get',
        networkError,
        delay,
        headers,
        params,
        pathReg,
      }) => {
        const onMethod = `on${capitalizeFirstLetter(method)}`;

        let matchUrl: string | RegExp = pathReg || url;

        if (typeof url === 'string' && url.includes('/:')) {
          const [basePath] = url.split('/:');
          matchUrl = new RegExp(`${basePath}/*`);
        }

        const req = mock[onMethod](matchUrl, params);
        if (networkError) {
          req.networkError();
        } else {
          req.reply(async (...args: any[]) => {
            const data = await resolveWithDelay(
              delay,
              await responseData(...args)
            );
            // Returns response type and content off all (mock) backendsystems APIs.
            // Change this to trigger same response type for all APIs e.g. [500, data, headers];.
            return [
              typeof status === 'function' ? status(...args) : status,
              data,
              headers,
            ];
          });
        }
      }
    );
  });
}

if (!IS_TAP && process.env.BFF_ENABLE_MOCK_ADAPTER === 'true') {
  console.info('Axios Mock adapter enabled');
  enableMockAdapter();
}

export interface RequestConfig<Source, Transformed> {
  url: string;
  format: (data: Source) => Transformed;
}

export function clearSessionCache(requestID: requestID) {
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
  ].join('-');
}

export async function requestData<T>(
  config: DataRequestConfig,
  requestID: requestID,
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

  const isGetRequest = requestConfig.method?.toLowerCase() === 'get';

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
    if (cache.get(cacheKey)) {
      cache.get(cacheKey).resolve(responseData);
    }

    return responseData;
  } catch (error: any) {
    if (IS_DEBUG) {
      console.error(error);
    }

    const errorMessageBasic = error.toString();
    const errorMessage = error?.response?.data
      ? `${errorMessageBasic} ${JSON.stringify(error.response.data)}`
      : errorMessageBasic;

    captureException(error, {
      properties: {
        message: errorMessage,
      },
    });

    const statusCode = error.statusCode ?? error?.response?.status;
    const responseData = apiErrorResult(
      errorMessage,
      null,
      statusCode ? `${statusCode}` : undefined
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

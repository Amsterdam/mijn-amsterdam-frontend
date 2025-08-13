import { get } from 'stack-trace';

import { jsonCopy } from '../../universal/helpers/utils';
import {
  ApiConfig,
  DataRequestConfig,
  SourceApiKey,
} from '../config/source-api';

// To keep the cache key small, we exclude some generic function names.
const EXCLUDE_GENERIC_FUNCTION_NAMES_FROM_CACHE_KEY = [
  'all',
  'map',
  'allSettled',
  'processTicksAndRejections',
  'getApiConfig',
  'getApiConfigBasedCacheKey',
];
// To keep the cache key small, we only take the last 3 function names from the stack trace.
const SLICE_FUNCTION_NAMES = 3;

function getApiConfigBasedCacheKey(
  name: SourceApiKey,
  cacheKey_UNSAFE?: string
): string | null {
  if (!cacheKey_UNSAFE) {
    return null;
  }

  const trace = get();
  const traceFiltered = trace
    .toReversed()
    .map((frame) => frame.getFunctionName())
    .filter(
      (name) =>
        name && !EXCLUDE_GENERIC_FUNCTION_NAMES_FROM_CACHE_KEY.includes(name)
    );
  const stackSimple = traceFiltered
    .slice(
      Math.max(0, traceFiltered.length - SLICE_FUNCTION_NAMES),
      traceFiltered.length
    )
    .join('.');

  return `${name}-${stackSimple}-${cacheKey_UNSAFE}`;
}

export function getApiConfig(
  name: SourceApiKey,
  config: DataRequestConfig = {}
): Readonly<DataRequestConfig> {
  const apiConfig = ApiConfig[name];

  // Take of the agent because it cannot be jsonCopied.
  const agent = apiConfig.httpsAgent;
  delete apiConfig.httpsAgent;

  // Copy the config to prevent assigning privacy/identity related information across requests
  const apiConfigCopy = jsonCopy(apiConfig);

  // copy the config and transfer the https agent instance.
  if (agent) {
    // re-assign the agent
    apiConfig.httpsAgent = agent;

    // also assign agent to copy
    apiConfigCopy.httpsAgent = agent;
  }

  let customUrl = '';

  if (typeof config.formatUrl === 'function') {
    customUrl = config.formatUrl(apiConfig);
  }

  const headers = apiConfigCopy.headers ?? {};

  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  const cacheKey_UNSAFE = getApiConfigBasedCacheKey(
    name,
    config.cacheKey_UNSAFE
  );

  return Object.assign(
    apiConfigCopy,
    config,
    customUrl ? { url: customUrl } : null,
    { headers },
    cacheKey_UNSAFE ? { cacheKey_UNSAFE } : null
  );
}

export function getRequestConfigCacheKey(requestConfig: DataRequestConfig) {
  return [
    requestConfig.cacheTimeout ?? 'no-cache-timeout', // Cache timeout can be adjusted and we want the adjusted value to be part of the cache key so we can invalidate it immediately.
    requestConfig.method,
    requestConfig.url,
    requestConfig.params ? JSON.stringify(requestConfig.params) : 'no-params',
    requestConfig.data ? JSON.stringify(requestConfig.data) : 'no-data',
    requestConfig.headers
      ? JSON.stringify(requestConfig.headers)
      : 'no-headers',
  ].join('-');
}

export function createSessionBasedCacheKey(
  sessionID: SessionID,
  identifier?: string
) {
  return `${identifier ? `${identifier}-` : ''}${sessionID}`;
}

export function getHostNameFromUrl(url?: string): string | null {
  if (!url) {
    return null;
  }

  return new URL(url).hostname;
}

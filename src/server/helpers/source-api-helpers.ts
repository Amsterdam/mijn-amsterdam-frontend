import type { SomeOtherString } from '../../universal/helpers/types';
import { jsonCopy } from '../../universal/helpers/utils';
import {
  ApiConfig,
  DataRequestConfig,
  SourceApiName,
} from '../config/source-api';

function getApiConfigBasedCacheKey(
  name: SourceApiName | SomeOtherString,
  cacheKey_UNSAFE?: string
): string | null {
  if (!cacheKey_UNSAFE) {
    return null;
  }

  return `${name}-${cacheKey_UNSAFE}`;
}

export function getCustomApiConfig(...configs: DataRequestConfig[]) {
  return getApiConfig('CUSTOM_API', ...configs);
}

export function getApiConfig(
  name: SourceApiName | SomeOtherString,
  config: DataRequestConfig = {},
  ...additionalConfigs: DataRequestConfig[]
): Readonly<DataRequestConfig> {
  const apiConfig =
    name && name in ApiConfig ? ApiConfig[name as SourceApiName] : {};

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
    ...additionalConfigs,
    customUrl ? { url: customUrl } : null,
    { headers },
    cacheKey_UNSAFE ? { cacheKey_UNSAFE } : null
  );
}

export function getRequestConfigCacheKey(requestConfig: DataRequestConfig) {
  return [
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

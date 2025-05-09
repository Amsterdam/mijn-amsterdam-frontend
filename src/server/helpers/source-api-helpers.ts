import { jsonCopy } from '../../universal/helpers/utils';
import {
  ApiConfig,
  DataRequestConfig,
  SourceApiKey,
} from '../config/source-api';

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

  return Object.assign(
    apiConfigCopy,
    config,
    customUrl ? { url: customUrl } : null,
    { headers }
  );
}

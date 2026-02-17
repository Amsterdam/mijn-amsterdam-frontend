import axios, {
  type AxiosRequestConfig,
  type AxiosResponseTransformer,
} from 'axios';

import { getFromEnv } from './env';
import { debugRequest, debugResponse } from '../debug';

const splitIntoTerms = (env: string | undefined) =>
  (env?.split(',') ?? []).filter(Boolean).map((term) => term.trim());

const debugResponseDataTerms = splitIntoTerms(
  getFromEnv('DEBUG_RESPONSE_DATA', false)
);
if (debugResponseDataTerms.length > 0) {
  debugResponse(debugResponseDataTerms, 'debug response data terms');
}

function isDebugResponseDataMatch(config: AxiosRequestConfig) {
  return function isDebugResponseDataMatch(term: string) {
    const hasTermInRequestUrl = !!config.url?.includes(term.trim());
    const hasTermInRequestParams = config.params
      ? JSON.stringify(config.params).includes(term.trim())
      : false;
    return hasTermInRequestUrl || hasTermInRequestParams;
  };
}

export function addResponseDataDebugging(config: AxiosRequestConfig) {
  config.transformResponse =
    config.transformResponse as AxiosResponseTransformer[];

  const configExcerpt = {
    method: config.method ?? 'GET',
    url: config.url,
    params: config.params,
  };

  const isDebugResponseDataTermMatch =
    debugResponseDataTerms?.some(isDebugResponseDataMatch(config)) ?? false;

  // Add default transformer if no transformers are defined
  if (!config.transformResponse) {
    const transformers: AxiosResponseTransformer[] = [];
    config.transformResponse = transformers.concat(
      axios.defaults.transformResponse ?? []
    );
  }

  // Add an additional transformer to log the raw response before any other transformers are applied
  config.transformResponse?.unshift((responseDataRaw, headers, status) => {
    if (isDebugResponseDataTermMatch) {
      debugResponse('');
      debugResponse('------');
      debugResponse('[CONFIG]: %o', configExcerpt);
      debugResponse('[RESPONSE DATA]: %s', responseDataRaw);
      debugResponse('[HEADERS]: %o', headers);
      debugResponse('[STATUS]: %d', status);
    }
    return responseDataRaw;
  });
}

const debugRequestDataTerms = () =>
  splitIntoTerms(getFromEnv('DEBUG_REQUEST_DATA', false));

if (debugRequestDataTerms().length > 0) {
  debugResponse(debugRequestDataTerms(), 'debug request data terms');
}

function isDebugRequestDataMatch(
  config: Pick<AxiosRequestConfig, 'url' | 'params' | 'data'>
) {
  return function isDebugRequestDataMatch(term: string) {
    const [urlTerm, dataTerms_] = term.split('|');
    const dataTerms = dataTerms_?.split(';');

    const hasTermInRequestUrl =
      !!urlTerm && config.url?.includes(urlTerm?.trim());

    const paramJsonStr = JSON.stringify(config.params || '');
    const hasTermInRequestParams = !!dataTerms?.some((term) =>
      paramJsonStr.includes(term)
    );

    const dataJsonStr = JSON.stringify(config.data || '');
    const hasTermInRequestData = !!dataTerms?.some((term) =>
      dataJsonStr.includes(term)
    );

    const termMatchesParams = !dataTerms || hasTermInRequestParams;
    const termMatchesData = !dataTerms || hasTermInRequestData;
    return hasTermInRequestUrl && (termMatchesParams || termMatchesData);
  };
}

export function addRequestDataDebugging(config: AxiosRequestConfig): void {
  const configExcerpt = {
    method: config.method ?? 'GET',
    url: config.url,
    params: config.params,
    data: config.data,
  };
  const isDebugRequestDataTermMatch =
    debugRequestDataTerms?.().some(isDebugRequestDataMatch(config)) ?? false;

  if (isDebugRequestDataTermMatch) {
    debugRequest('------');
    debugRequest('[CONFIG]: %o', configExcerpt);
  }
}

export const forTesting = {
  isDebugRequestDataMatch,
};

import axios, {
  type AxiosRequestConfig,
  type AxiosResponseTransformer,
} from 'axios';

import { getFromEnv } from './env.ts';
import { debugRequest, debugResponse } from '../debug.ts';

function splitBy(str: string | undefined, delimiter: string) {
  return (str?.split(delimiter) ?? [])
    .filter(Boolean)
    .map((term) => term.trim());
}

function splitIntoTerms(env: string | undefined) {
  return splitBy(env, ',');
}

function debugResponseDataTerms() {
  return splitIntoTerms(getFromEnv('DEBUG_RESPONSE_DATA', false));
}

if (debugResponseDataTerms().length > 0) {
  debugResponse(debugResponseDataTerms(), 'debug response data terms');
}

function splitSubTerms(term: string | undefined) {
  return splitBy(term, ';');
}

function hasAllSubTerms(haystack: string, terms: string[]) {
  return terms.every((subTerm) => haystack.includes(subTerm));
}

function isDebugResponseDataMatch(
  config: AxiosRequestConfig,
  responseDataRaw: string
) {
  const paramJsonStr = JSON.stringify(config.params || '');

  function isStructuredResponseMatch(term: string) {
    const [urlTermsRaw, paramTermsRaw = '', responseTermsRaw = ''] =
      term.split('|');
    const urlTerms = splitSubTerms(urlTermsRaw);
    if (urlTerms.length === 0) {
      return false;
    }
    const requestUrl = config.url ?? '';
    const hasTermInRequestUrl = hasAllSubTerms(requestUrl, urlTerms);

    const paramTerms = splitSubTerms(paramTermsRaw);
    const hasTermInRequestParams = hasAllSubTerms(paramJsonStr, paramTerms);

    const responseTerms = splitSubTerms(responseTermsRaw);
    const hasTermInResponseData = hasAllSubTerms(
      responseDataRaw,
      responseTerms
    );

    return (
      hasTermInRequestUrl && hasTermInRequestParams && hasTermInResponseData
    );
  }

  return function isDebugResponseDataMatch(term: string) {
    return isStructuredResponseMatch(term);
  };
}

export function addResponseDataDebugging(config: AxiosRequestConfig) {
  const configuredTransformers = config.transformResponse;
  const transformResponse: AxiosResponseTransformer[] = [];

  if (configuredTransformers) {
    if (Array.isArray(configuredTransformers)) {
      transformResponse.push(...configuredTransformers);
    } else {
      transformResponse.push(configuredTransformers);
    }
  } else if (axios.defaults.transformResponse) {
    const defaultTransformers = axios.defaults.transformResponse;
    if (Array.isArray(defaultTransformers)) {
      transformResponse.push(...defaultTransformers);
    } else {
      transformResponse.push(defaultTransformers);
    }
  }

  config.transformResponse = transformResponse;

  const configExcerpt = {
    method: config.method ?? 'GET',
    url: config.url,
    params: config.params,
  };

  // Add an additional transformer to log the raw response before any other transformers are applied
  config.transformResponse?.unshift((responseDataRaw, headers, status) => {
    const responseDataRawAsString = String(responseDataRaw ?? '');
    const isDebugResponseDataTermMatch =
      debugResponseDataTerms().some(
        isDebugResponseDataMatch(config, responseDataRawAsString)
      ) ?? false;
    if (isDebugResponseDataTermMatch) {
      debugResponse('');
      debugResponse('------');
      debugResponse('[CONFIG]: %O', configExcerpt);
      debugResponse('[RESPONSE DATA]: %s', responseDataRawAsString);
      debugResponse('[HEADERS]: %o', headers);
      debugResponse('[STATUS]: %d', status);
    }
    return responseDataRaw;
  });
}

function debugRequestDataTerms() {
  return splitIntoTerms(getFromEnv('DEBUG_REQUEST_DATA', false));
}

if (debugRequestDataTerms().length > 0) {
  debugResponse(debugRequestDataTerms(), 'debug request data terms');
}

function isDebugRequestDataMatch(
  config: Pick<AxiosRequestConfig, 'url' | 'params' | 'data'>
) {
  return function isDebugRequestDataMatch(term: string) {
    const [urlTerm, dataTerms_] = term.split('|');
    const dataTerms = dataTerms_?.split(';');

    const hasTermInRequestUrl = !!urlTerm && config.url?.includes(urlTerm);

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
    debugRequestDataTerms().some(isDebugRequestDataMatch(config)) ?? false;

  if (isDebugRequestDataTermMatch) {
    debugRequest('------');
    debugRequest('[CONFIG]: %o', configExcerpt);
  }
}

export const forTesting = {
  isDebugResponseDataMatch,
  isDebugRequestDataMatch,
  debugResponse,
  debugRequest,
};

import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import { capitalizeFirstLetter } from '../../universal/helpers/text';
import { entries } from '../../universal/helpers/utils';
import { mockDataConfig, resolveWithDelay } from '../mock-data/index';
import {
  apiSuccesResult,
  apiErrorResult,
  apiPostponeResult,
} from '../../universal/helpers';

const REQUEST_TIMEOUT = 20000; // 20 seconds
const DEFAULT_REQUEST_CONFIG: AxiosRequestConfig = {
  timeoutErrorMessage: `De aanvraag van data bij deze api duurt te lang.`,
};

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios);

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

export interface RequestConfig<Source, Transformed> {
  url: string;
  format: (data: Source) => Transformed;
}

export async function requestData<T>(
  config: AxiosRequestConfig,
  postpone: boolean = false
) {
  if (process.env.NODE_ENV !== 'production') {
    enableMockAdapter();
  }

  if (postpone) {
    return apiPostponeResult();
  }

  try {
    const source = axios.CancelToken.source();

    setTimeout(() => {
      source.cancel('Request to source api timeout.');
    }, REQUEST_TIMEOUT);

    const request: AxiosPromise<T> = axios({
      ...DEFAULT_REQUEST_CONFIG,
      ...config,
      cancelToken: source.token,
    });

    const response: AxiosResponse<T> = await request;

    return apiSuccesResult<T>(response.data);
  } catch (error) {
    return apiErrorResult(error);
  }
}

import axios, { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';
import { mockDataConfig } from '../mock-data/index';
import { capitalizeFirstLetter } from './text';
import { entries } from './utils';

function enableMockAdapter() {
  const MockAdapter = require('axios-mock-adapter');

  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios);

  // Mock any GET request to /users
  // arguments for reply are (status, data, headers)
  mock.onGet('/users').reply(200, {
    users: [{ id: 1, name: 'John Smith' }],
  });

  entries(mockDataConfig).forEach(
    ([url, { status, responseData, method = 'get' }]) => {
      const onMethod = `on${capitalizeFirstLetter(method)}`;
      mock[onMethod](url).reply(
        status,
        typeof responseData === 'function' ? responseData() : responseData
      );
    }
  );
}

function handleRequestError(error: AxiosError) {
  console.log('handleRequestError', error);
}

export function requestSourceData<T>(
  config: AxiosRequestConfig
): AxiosPromise<T> {
  if (process.env.NODE_ENV !== 'production') {
    enableMockAdapter();
  }

  const request = axios(config);
  request.catch(handleRequestError);
  return request;
}

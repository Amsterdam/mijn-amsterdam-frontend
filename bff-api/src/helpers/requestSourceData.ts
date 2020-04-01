import axios, { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';

function handleRequestError(error: AxiosError) {
  console.log('handleRequestError', error);
}

export function requestSourceData<T>(
  config: AxiosRequestConfig
): AxiosPromise<T> {
  const request = axios(config);
  request.catch(handleRequestError);
  return request;
}

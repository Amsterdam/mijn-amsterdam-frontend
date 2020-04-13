import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  content: null;
  statusCode: number | string;
  status: 'failure';
}

export type ApiSuccessResponse<T> = {
  content: T;
  status: 'success';
  statusCode: number | string;
};

export type ApiMixedResponse<T> = {
  content: T;
  status: 'mixed' | 'failure' | 'success';
};

export type ApiPristineResponse = {
  content: null;
  status: 'pristine';
};

export type ApiUnknownResponse = {
  content: null;
  message: string;
  status: 'unknown';
};

export type FEApiResponseData<T extends (...args: any[]) => any> = ResolvedType<
  ReturnType<T>
>;

export type ApiResponse<T> = ApiErrorResponse | ApiSuccessResponse<T>;

export function isLoading(apiResponseData: any) {
  return apiResponseData.status === 'pristine';
}

export function isError(
  apiResponseData:
    | ApiErrorResponse
    | ApiPristineResponse
    | ApiSuccessResponse<any>
    | ApiMixedResponse<any>
    | ApiUnknownResponse,
  responseKey?: string
) {
  return (
    apiResponseData.status === 'failure' ||
    apiResponseData.status === 'unknown' ||
    (apiResponseData.status === 'mixed' && !responseKey) ||
    (responseKey &&
      apiResponseData.status === 'mixed' &&
      apiResponseData.content[responseKey]?.status === 'failure')
  );
}

export function apiErrorResult(error: AxiosError): ApiErrorResponse {
  return {
    content: null,
    message: error.response?.data?.message || error.toString(),
    status: 'failure',
    statusCode: error.response?.status || 500,
  };
}

export function apiSuccesResult<T>(content: T): ApiSuccessResponse<T> {
  return {
    content,
    status: 'success',
    statusCode: 200,
  };
}

export function apiMixedResult<T>(
  content: T,
  status: 'mixed' | 'success' | 'failure' = 'mixed'
): ApiMixedResponse<T> {
  return {
    content,
    status,
  };
}

export function apiPristineResponseData<T>(content: T) {
  return Object.entries(content).reduce((acc, [key, content]) => {
    return Object.assign(acc, { [key]: { content, status: 'pristine' } });
  }, {} as Record<keyof T, ApiPristineResponse>);
}

export function apiUnknownResult(message: string): ApiUnknownResponse {
  return {
    message,
    content: null,
    status: 'unknown',
  };
}

export function getMixedResultStatus(
  ...results: Array<ApiErrorResponse | ApiSuccessResponse<any>>
) {
  switch (true) {
    case results.every(result => result.status === 'success'):
      return 'success';
    case results.every(result => result.status === 'failure'):
      return 'failure';
    default:
      return 'mixed';
  }
}

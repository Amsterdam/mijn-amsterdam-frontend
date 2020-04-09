import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
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

export type ApiUnknownResponse = {
  message: string;
  status: 'unknown';
};

export type ApiResponse<T> = ApiErrorResponse | ApiSuccessResponse<T>;

export function isLoading(data: any) {
  return data === null;
}

export function isError(data: any) {
  return data !== null && data.isError;
}

export function apiErrorResult(error: AxiosError): ApiErrorResponse {
  return {
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

export function apiUnknownResult(message: string): ApiUnknownResponse {
  return {
    message,
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

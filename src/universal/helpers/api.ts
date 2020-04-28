import { AxiosError } from 'axios';

export interface ApiErrorResponse<T> {
  message: string;
  content: T;
  status: 'ERROR';
}

export type ApiSuccessResponse<T> = {
  content: T;
  status: 'OK';
};

// This state is used for checking if we are expecting data from the api.
export type ApiPristineResponse<T> = {
  content: T | null;
  status: 'PRISTINE';
};

// Used of the request to the api must be postponed, for example when using a feature toggle.
export type ApiPostponeResponse = {
  content: null;
  status: 'POSTPONE';
};

// Used if the request can't be made because of dependent requirements e.g using request params from data of another api which returns an error.
export type ApiUnknownResponse = {
  content: null;
  message: string;
  status: 'DEPENDENCY_ERROR';
};

export type ResponseStatus =
  | 'ERROR'
  | 'OK'
  | 'PRISTINE'
  | 'POSTPONE'
  | 'DEPENDENCY_ERROR';

export type FEApiResponseData<T extends (...args: any[]) => any> = ResolvedType<
  ReturnType<T>
>;

export type ApiResponse<T> =
  | ApiErrorResponse<T>
  | ApiSuccessResponse<T>
  | ApiPristineResponse<T>
  | ApiPostponeResponse;

export function isLoading(
  apiResponseData:
    | ApiSuccessResponse<any>
    | ApiErrorResponse<any>
    | ApiPostponeResponse
    | ApiUnknownResponse
    | ApiPristineResponse<any>
) {
  // If no responseData was found, assumes it's still loading
  return !!apiResponseData && apiResponseData.status === 'PRISTINE';
}

export function isError(
  apiResponseData:
    | ApiErrorResponse<any>
    | ApiPristineResponse<any>
    | ApiSuccessResponse<any>
    | ApiPostponeResponse
    | ApiUnknownResponse
) {
  return (
    apiResponseData.status === 'ERROR' ||
    apiResponseData.status === 'DEPENDENCY_ERROR'
  );
}

export function apiErrorResult<T>(
  error: AxiosError,
  content: T
): ApiErrorResponse<T> {
  return {
    content,
    message: error.response?.data?.message || error.toString(),
    status: 'ERROR',
  };
}

export function apiSuccesResult<T>(content: T): ApiSuccessResponse<T> {
  return {
    content,
    status: 'OK',
  };
}

export function apiPristineResult<T>(content: T): ApiPristineResponse<T> {
  return {
    content,
    status: 'PRISTINE',
  };
}

export function apiPostponeResult(): ApiPostponeResponse {
  return {
    content: null,
    status: 'POSTPONE',
  };
}

export function apiUnknownResult(message: string): ApiUnknownResponse {
  return {
    message,
    content: null,
    status: 'DEPENDENCY_ERROR',
  };
}

export function apiErrorResponseData<T>(
  pristineResponseData: T,
  error: AxiosError<any>
) {
  return Object.entries(pristineResponseData).reduce(
    (acc, [key, pristineResponseData]) => {
      return Object.assign(acc, {
        [key]: apiErrorResult(error, pristineResponseData.content),
      });
    },
    {} as Record<keyof T, ApiErrorResponse<any>>
  );
}

export function unwrapResponseContent(responseData: {
  [key: string]: ApiResponse<any>;
}) {
  return Object.entries(responseData).reduce(
    (acc, [apiStateKey, { content, status }]) => {
      if (status === 'OK') {
        return Object.assign(acc, { [apiStateKey]: content });
      }
      return acc;
    },
    {}
  );
}

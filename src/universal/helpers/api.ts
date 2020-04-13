import { AxiosError } from 'axios';
import { AppState } from '../../client/AppState';
import { ErrorNames } from '../config';

export interface ApiErrorResponse {
  message: string;
  content: null;
  status: 'failure';
}

export type ApiSuccessResponse<T> = {
  content: T;
  status: 'success';
};

export type ApiMixedResponse<T> = {
  content: T;
  status: 'mixed';
};

// This state is used for checking if we are expecting data from the api.
export type ApiPristineResponse = {
  content: null;
  status: 'pristine';
};

// Used of the request to the api must be postponed, for example when using a feature toggle.
export type ApiPostponeResponse = {
  content: null;
  status: 'postpone';
};

// Used if the request can't be made because of dependent requirements e.g using request params from data of another api which returns an error.
export type ApiUnknownResponse = {
  content: null;
  message: string;
  status: 'dependency-failure';
};

export type FEApiResponseData<T extends (...args: any[]) => any> = ResolvedType<
  ReturnType<T>
>;

export type ApiResponse<T> =
  | ApiErrorResponse
  | ApiSuccessResponse<T>
  | ApiPostponeResponse;

export function isLoading(
  apiResponseData:
    | ApiSuccessResponse<any>
    | ApiErrorResponse
    | ApiMixedResponse<any>
    | ApiPostponeResponse
    | ApiUnknownResponse
    | ApiPristineResponse
) {
  // If no responseData was found, assumes it's still loading
  return !!apiResponseData && apiResponseData.status === 'pristine';
}

export function isError(
  apiResponseData:
    | ApiErrorResponse
    | ApiPristineResponse
    | ApiSuccessResponse<any>
    | ApiPostponeResponse
    | ApiMixedResponse<any>
    | ApiUnknownResponse,
  responseKey?: string
) {
  return (
    apiResponseData.status === 'failure' ||
    apiResponseData.status === 'dependency-failure' ||
    (apiResponseData.status === 'mixed' && !responseKey) ||
    // Check if nested response has an error(like) status
    (responseKey &&
      apiResponseData.status === 'mixed' &&
      !['success', 'postpone', 'pristine'].includes(
        apiResponseData.content[responseKey]?.status
      ))
  );
}

export function apiErrorResult(
  error: AxiosError,
  content: any = null
): ApiErrorResponse {
  return {
    content,
    message: error.response?.data?.message || error.toString(),
    status: 'failure',
  };
}

export function apiSuccesResult<T>(content: T): ApiSuccessResponse<T> {
  return {
    content,
    status: 'success',
  };
}

export function apiPostponeResult(): ApiPostponeResponse {
  return {
    content: null,
    status: 'postpone',
  };
}

export function apiMixedResult<T>(content: T): ApiMixedResponse<T> {
  return {
    content,
    status: 'mixed',
  };
}

export function apiUnknownResult(message: string): ApiUnknownResponse {
  return {
    message,
    content: null,
    status: 'dependency-failure',
  };
}

export function apiPristineResponseData<T>(content: T) {
  return Object.entries(content).reduce((acc, [key, content]) => {
    return Object.assign(acc, { [key]: { content, status: 'pristine' } });
  }, {} as Record<keyof T, ApiPristineResponse>);
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
    {} as Record<keyof T, ApiErrorResponse>
  );
}

export function getApiErrors(appState: AppState) {
  return (
    Object.entries(appState)
      // Search for nested api responses and flatten
      .flatMap(([apiStateKey, apiResponseData]) => {
        if (apiResponseData.status === 'mixed') {
          return (
            Object.entries(apiResponseData.content)
              .filter(
                ([key, response]: any) =>
                  'status' in response && 'content' in response
              )
              // Map nested api response to error name key
              .map(([key, response]: any) => [
                `${apiStateKey}_${key.toUpperCase()}`,
                response,
              ])
          );
        }
        return [[apiStateKey, apiResponseData]];
      })
      .filter(([, apiResponseData]: any) => {
        return isError(apiResponseData);
      })
      .map(([stateKey, apiResponseData]: any) => {
        const name = ErrorNames[stateKey] || stateKey;
        return {
          name,
          error:
            ('message' in apiResponseData ? apiResponseData.message : null) ||
            'Communicatie met api mislukt.',
        };
      })
  );
}

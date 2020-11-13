export interface ApiErrorResponse<T> {
  message: string;
  content: T;
  status: 'ERROR';
  sentry?: string;
  id?: string;
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
export type ApiDependencyErrorResponse = {
  content: null;
  message: string;
  status: 'DEPENDENCY_ERROR';
  sentry?: string;
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
  | ApiPostponeResponse
  | ApiDependencyErrorResponse;

export function isLoading(apiResponseData: ApiResponse<any>) {
  // If no responseData was found, assumes it's still loading
  return (
    (!apiResponseData && !isError(apiResponseData)) ||
    apiResponseData?.status === 'PRISTINE'
  );
}

export function isError(apiResponseData: ApiResponse<any>) {
  return (
    apiResponseData?.status === 'ERROR' ||
    apiResponseData?.status === 'DEPENDENCY_ERROR'
  );
}

export function apiErrorResult<T>(
  error: string,
  content: T,
  sentryId?: string | null
): ApiErrorResponse<T> {
  const errorResponse: ApiErrorResponse<T> = {
    content,
    message: error,
    status: 'ERROR',
  };

  if (sentryId) {
    errorResponse.sentry = sentryId;
  }

  return errorResponse;
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

export function apiDependencyError(
  apiResponses: Record<string, ApiResponse<unknown>>
): ApiDependencyErrorResponse {
  return {
    message: Object.entries(apiResponses).reduce((acc, [key, response]) => {
      if (
        response.status === 'ERROR' ||
        response.status === 'DEPENDENCY_ERROR'
      ) {
        acc += `[${key}] ${response.message} ${
          response.sentry ? `\nsentry: ${response.sentry}` : ''
        }\n`;
      }
      return acc;
    }, ``),
    content: null,
    status: 'DEPENDENCY_ERROR',
  };
}

export function getSettledResult<T extends any>(
  result: PromiseSettledResult<T>
) {
  if (result.status === 'fulfilled') {
    return result.value;
  }
  let errorMessage = result.reason.toString();
  try {
    errorMessage = result.reason.message || result.reason.toString();
  } catch (error) {
    errorMessage = 'An error occurred';
  }
  return apiErrorResult(errorMessage, null);
}

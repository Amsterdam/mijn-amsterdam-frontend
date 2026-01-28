export interface ApiErrorResponse<T> {
  message: string;
  content: T;
  status: 'ERROR';
  id?: string;
  code?: number;
}

export type FailedDependencies = Record<string, ApiErrorResponse<unknown>>;

export type ApiSuccessResponse<T> = {
  content: T;
  status: 'OK';
  id?: string;
  failedDependencies?: FailedDependencies;
};

// This state is used for checking if we are expecting data from the api.
export type ApiPristineResponse<T> = {
  content: T | null;
  status: 'PRISTINE';
  isActive?: boolean;
  profileTypes?: ProfileType[];
};

export interface PristineStageConfig {
  isActive?: boolean;
  profileTypes?: ProfileType[];
}

// Used of the request to the api must be postponed, for example when using a feature toggle.
export type ApiPostponeResponse<T> = {
  content: T;
  status: 'POSTPONE';
};

// Used if the request can't be made because of dependent requirements e.g using request params from data of another api which returns an error.
export type ApiDependencyErrorResponse = {
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

export type ApiResponse_DEPRECATED<T> =
  | ApiErrorResponse<null>
  | ApiSuccessResponse<T>
  | ApiPristineResponse<T>
  | ApiPostponeResponse<T>
  | ApiDependencyErrorResponse;

export type ApiResponse<T> =
  | ApiErrorResponse<null>
  | ApiSuccessResponse<T>
  | ApiPostponeResponse<null>;

export type ApiResponsePromise<T> = Promise<ApiResponse<T>>;

export function isLoading(apiResponseData: ApiResponse_DEPRECATED<unknown>) {
  // If no responseData was found, assumes it's still loading
  return !!(
    (!apiResponseData && !isError(apiResponseData)) ||
    !!(apiResponseData?.status === 'PRISTINE' && apiResponseData.isActive)
  );
}

export function isOk(apiResponseData: ApiResponse_DEPRECATED<unknown>) {
  return apiResponseData?.status === 'OK';
}

export function isError(
  apiResponseData: ApiResponse_DEPRECATED<unknown>,
  includeFailedDependencies: boolean = true
) {
  return (
    apiResponseData?.status === 'ERROR' ||
    apiResponseData?.status === 'DEPENDENCY_ERROR' ||
    (includeFailedDependencies &&
      apiResponseData?.status === 'OK' &&
      !!apiResponseData?.failedDependencies)
  );
}

export function hasFailedDependency(
  apiResponseData: ApiResponse_DEPRECATED<unknown> | null,
  dependencyKey: string
) {
  return (
    apiResponseData?.status === 'OK' &&
    !!apiResponseData?.failedDependencies &&
    dependencyKey in apiResponseData.failedDependencies
  );
}

export function apiErrorResult<T>(
  error: string,
  content: T,
  statusCode?: ApiErrorResponse<T>['code']
): ApiErrorResponse<T> {
  const errorResponse: ApiErrorResponse<T> = {
    content,
    message: error,
    status: 'ERROR',
  };

  if (statusCode) {
    errorResponse.code = statusCode;
  }

  return errorResponse;
}

export function apiSuccessResult<T>(
  content: T,
  failedDependencies?: FailedDependencies
): ApiSuccessResponse<T> {
  const result: ApiSuccessResponse<T> = {
    content,
    status: 'OK',
  };
  if (failedDependencies) {
    result.failedDependencies = failedDependencies;
  }
  return result;
}

export function getFailedDependencies<T extends object>(results: T) {
  let failedDependencies: FailedDependencies | undefined = undefined;

  for (const [key, apiResult] of Object.entries(results)) {
    if (
      apiResult?.status === 'ERROR' ||
      apiResult?.status === 'DEPENDENCY_ERROR'
    ) {
      if (!failedDependencies) {
        failedDependencies = {};
      }
      failedDependencies[key] = apiResult;
    }
  }

  return failedDependencies;
}

export function apiPristineResult<T>(
  content: T,
  config?: PristineStageConfig
): ApiPristineResponse<T> {
  return {
    content,
    status: 'PRISTINE',
    isActive: config?.isActive ?? true,
    profileTypes: config?.profileTypes ?? [],
  };
}

export function apiPostponeResult<T>(content: T): ApiPostponeResponse<T> {
  return {
    content,
    status: 'POSTPONE',
  };
}

export function apiDependencyError(
  apiResponses: Record<string, ApiResponse_DEPRECATED<unknown>>
): ApiDependencyErrorResponse {
  return {
    message: Object.entries(apiResponses).reduce((acc, [key, response]) => {
      if (
        response.status === 'ERROR' ||
        response.status === 'DEPENDENCY_ERROR'
      ) {
        acc += `[${key}] ${response.message}`;
      }
      return acc;
    }, ''),
    content: null,
    status: 'DEPENDENCY_ERROR',
  };
}

export function getSettledResult<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value;
  }
  let errorMessage: string;
  try {
    errorMessage = result.reason.message || result.reason.toString();
  } catch (_) {
    errorMessage = 'An error occurred';
  }
  return apiErrorResult(errorMessage, null);
}

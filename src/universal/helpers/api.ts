export interface ApiErrorResponse<T> {
  message: string;
  content: T;
  status: 'ERROR';
  id?: string;
  code?: number;
}

export type FailedDependencies = Record<string, ApiErrorResponse<any>>;

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
export type ApiPostponeResponse = {
  content: null;
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

export type FEApiResponseData<T extends (...args: any[]) => any> = ResolvedType<
  ReturnType<T>
>;

export type ApiResponse<T extends unknown = unknown> =
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

export function isOk(apiResponseData: ApiResponse<any>) {
  return apiResponseData?.status === 'OK';
}

export function isError(
  apiResponseData: ApiResponse<any>,
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
  apiResponseData: ApiResponse<any>,
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
        acc += `[${key}] ${response.message}`;
      }
      return acc;
    }, ''),
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
  let errorMessage: string;
  try {
    errorMessage = result.reason.message || result.reason.toString();
  } catch (error) {
    errorMessage = 'An error occurred';
  }
  return apiErrorResult(errorMessage, null);
}

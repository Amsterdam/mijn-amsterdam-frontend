import { HttpStatusCode } from 'axios';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import { generatePath, matchPath } from 'react-router';
import z from 'zod';

import { PUBLIC_BFF_ENDPOINTS } from './bff-routes';
import {
  ApiResponse_DEPRECATED,
  apiErrorResult,
} from '../../universal/helpers/api';
import type { AuthProfileAndToken } from '../auth/auth-types';
import { BFF_API_BASE_URL } from '../config/app';

type BFFRouter = express.Router & { BFF_ID: string };

export type RecordStr2 = Record<string, string>;

export function createBFFRouter({
  id,
  isEnabled = true,
}: {
  id: string;
  isEnabled?: boolean;
}): BFFRouter {
  const router = express.Router() as BFFRouter;
  router.BFF_ID = id;

  if (!isEnabled) {
    router.use((_req: Request, res: Response, next: NextFunction) => {
      next('router');
    });
  }

  return router;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export type RequestWithQueryParams<T extends RecordStr2> = Request<
  {},
  {},
  {},
  T
>;

export type RequestWithRouteAndQueryParams<
  T extends RecordStr2 = RecordStr2,
  T2 extends RecordStr2 = RecordStr2,
> = Request<T, {}, {}, T2>;
/* eslint-enable @typescript-eslint/no-empty-object-type */

export type ResponseAuthenticated = Response & {
  locals: {
    [key: string]: unknown;
    authProfileAndToken: AuthProfileAndToken;
    userID: AuthProfileAndToken['profile']['id'];
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function queryParams<T extends Record<string, any>>(req: Request) {
  return req.query as T;
}

export function isPublicEndpoint(pathRequested: string) {
  return PUBLIC_BFF_ENDPOINTS.some((pathPublic) => {
    return !!matchPath(pathPublic, pathRequested);
  });
}

export function isProtectedRoute(pathRequested: string) {
  // NOT A PUBLIC ENDPOINT
  return !isPublicEndpoint(pathRequested);
}

/** Helper for prepending a route with a baseUrl and optionally interpolating route parameters.
 *
 * # Params
 * | path: Path you want to prepend or interpolate the params into.
 * | params: Optional value to interpolate into the url parameters or a Tuple with query params and or url (path) params.
 * | baseUrl: Value that will be the base of the route (default value: `BFF_API_BASE_URL`)
 */
type QueryParams = RecordStr2;
type PathParams = RecordStr2;
type QueryAndOrPathParams = [QueryParams, PathParams] | [QueryParams];

export function generateFullApiUrlBFF(
  path: string,
  params?: PathParams | QueryAndOrPathParams,
  baseUrl: string = BFF_API_BASE_URL
) {
  // QueryParams are only provided when pathParams is a tuple.
  const [queryParams, pathParams] = Array.isArray(params)
    ? params
    : [undefined, params];
  const query = queryParams ? `?${new URLSearchParams(queryParams)}` : '';
  return `${baseUrl}${generatePath(path, pathParams)}${query}`;
}

/** Sets the right statuscode and sends a response. */
export function sendResponse(
  res: Response,
  apiResponse: ApiResponse_DEPRECATED<unknown>
) {
  if (apiResponse.status === 'ERROR') {
    res.status(
      typeof apiResponse.code === 'number'
        ? apiResponse.code
        : HttpStatusCode.InternalServerError
    );
  }

  return res.send(apiResponse);
}

export function sendBadRequest(res: Response, reason: string) {
  return sendResponse(
    res,
    apiErrorResult(`Bad request: ${reason}`, null, HttpStatusCode.BadRequest)
  );
}

export function sendInternalServerError(res: Response, reason: string) {
  return sendResponse(
    res,
    apiErrorResult(
      `Internal server error: ${reason}`,
      null,
      HttpStatusCode.InternalServerError
    )
  );
}

export function sendBadRequestInvalidInput(res: Response, error: unknown) {
  let inputValidationError = 'Invalid input';

  if (error instanceof z.ZodError) {
    inputValidationError = error.issues
      .map(
        (e) =>
          `for property '${e.path.join('.') || '.'}' with error '${e.message}'`
      )
      .join(' - ');
  }

  return sendBadRequest(res, inputValidationError);
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
) {
  return sendResponse(
    res,
    apiErrorResult(message, null, HttpStatusCode.Unauthorized)
  );
}

export function send404(res: Response) {
  return sendResponse(
    res,
    apiErrorResult('Not Found', null, HttpStatusCode.NotFound)
  );
}

export function sendServiceUnavailable(res: Response) {
  return sendResponse(
    res,
    apiErrorResult(
      'Service Unavailable',
      null,
      HttpStatusCode.ServiceUnavailable
    )
  );
}

export function sendMessage(
  res: Response,
  id: string,
  event: string = 'message',
  data?: object | string | number | null
) {
  const doStringify = typeof data !== 'string';
  const payload = doStringify ? JSON.stringify(data) : data;
  const message = `event: ${event}\nid: ${id}\ndata: ${payload}\n\n`;
  res.write(message);
}

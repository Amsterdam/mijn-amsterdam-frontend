import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';
import { generatePath, matchPath } from 'react-router';

import { PUBLIC_BFF_ENDPOINTS } from './bff-routes';
import {
  ApiResponse_DEPRECATED,
  apiErrorResult,
} from '../../universal/helpers/api';
import { BFF_API_BASE_URL } from '../config/app';

/* eslint-disable @typescript-eslint/no-empty-object-type */
export type RequestWithQueryParams<T extends Record<string, string>> = Request<
  {},
  {},
  {},
  T
>;

export type RequestWithRouteAndQueryParams<
  T extends Record<string, string> = Record<string, string>,
  T2 extends Record<string, string> = Record<string, string>,
> = Request<T, {}, {}, T2>;
/* eslint-enable @typescript-eslint/no-empty-object-type */

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
type QueryParams = Record<string, string>;
type PathParams = Record<string, string>;
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
  apiResponse: ApiResponse_DEPRECATED<any>
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

export function sendBadRequest(
  res: Response,
  reason: string,
  content: object | string | null = null
) {
  return res
    .status(HttpStatusCode.BadRequest)
    .send(
      apiErrorResult(
        `Bad request: ${reason}`,
        content,
        HttpStatusCode.BadRequest
      )
    );
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
) {
  res.status(HttpStatusCode.Unauthorized);
  return res.send(apiErrorResult(message, null, HttpStatusCode.Unauthorized));
}

export function send404(res: Response) {
  return sendResponse(
    res,
    apiErrorResult('Not Found', null, HttpStatusCode.NotFound)
  );
}
export function sendMessage(
  res: Response,
  id: string,
  event: string = 'message',
  data?: any
) {
  const doStringify = typeof data !== 'string';
  const payload = doStringify ? JSON.stringify(data) : data;
  const message = `event: ${event}\nid: ${id}\ndata: ${payload}\n\n`;
  res.write(message);
}

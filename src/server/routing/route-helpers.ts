import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';
import express from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { generatePath, matchPath } from 'react-router';

import { PUBLIC_BFF_ENDPOINTS } from './bff-routes';
import {
  ApiResponse_DEPRECATED,
  apiErrorResult,
} from '../../universal/helpers/api';
import { BFF_API_BASE_URL } from '../config/app';

type BFFRouter = express.Router & { BFF_ID: string };

export function createBFFRouter({ id: id }: { id: string }): BFFRouter {
  const authRouterDevelopment = express.Router() as BFFRouter;
  authRouterDevelopment.BFF_ID = id;
  return authRouterDevelopment;
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export type RequestWithQueryParams<T extends Record<string, string>> = Request<
  {},
  {},
  {},
  T
>;

export type RequestWithRouteAndQueryParams<
  T extends ParamsDictionary = Record<string, string>,
  T2 extends qs.ParsedQs = Record<string, string>,
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

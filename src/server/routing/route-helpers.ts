import type { Request, Response } from 'express';
import { generatePath, matchPath } from 'react-router-dom';

import { PUBLIC_BFF_ENDPOINTS } from './bff-routes';
import { HTTP_STATUS_CODES } from '../../universal/constants/errorCodes';
import { ApiResponse, apiErrorResult } from '../../universal/helpers/api';
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
    return !!matchPath(pathPublic, {
      path: pathRequested,
    });
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
 * | params: Optional value to interpolate into the url parameters.
 * | baseUrl: Value that will be the base of the route (default value: `BFF_API_BASE_URL`)
 */
export function generateFullApiUrlBFF(
  path: string,
  pathParams?: Record<string, string>,
  baseUrl: string = BFF_API_BASE_URL
) {
  return `${baseUrl}${generatePath(path, pathParams)}`;
}

/** Sets the right statuscode and sends a response. */
export function sendResponse(res: Response, apiResponse: ApiResponse<any>) {
  if (apiResponse.status === 'ERROR') {
    res.status(
      typeof apiResponse.code === 'number'
        ? apiResponse.code
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
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
    .status(HTTP_STATUS_CODES.BAD_REQUEST)
    .send(
      apiErrorResult(
        `Bad request: ${reason}`,
        content,
        HTTP_STATUS_CODES.BAD_REQUEST
      )
    );
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
) {
  res.status(HTTP_STATUS_CODES.UNAUTHORIZED);
  return res.send(
    apiErrorResult(message, null, HTTP_STATUS_CODES.UNAUTHORIZED)
  );
}

export function send404(res: Response) {
  res.status(HTTP_STATUS_CODES.NOT_FOUND);
  return res.send(
    apiErrorResult('Not Found', null, HTTP_STATUS_CODES.NOT_FOUND)
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

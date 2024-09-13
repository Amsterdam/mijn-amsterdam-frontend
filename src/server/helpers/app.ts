import type { NextFunction, Request, Response } from 'express';
import * as jose from 'jose';
import { generatePath, matchPath } from 'react-router-dom';
import uid from 'uid-safe';
import { ApiResponse, apiErrorResult } from '../../universal/helpers/api';

import { BFF_API_BASE_URL, IS_DEBUG, PUBLIC_BFF_ENDPOINTS } from '../config';
import { clearSessionCache } from './source-api-request';

// const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

export function requestID(req: Request, res: Response, next: NextFunction) {
  res.locals.requestID = uid.sync(18);
  next();
}

/** Sets the right statuscode and sends a response. */
export function sendResponse(res: Response, apiResponse: ApiResponse) {
  if (apiResponse.status === 'ERROR') {
    res.status(typeof apiResponse.code === 'number' ? apiResponse.code : 500);
  }

  return res.send(apiResponse);
}

export function sendBadRequest(
  res: Response,
  reason: string,
  content: object | string | null = null
) {
  return res
    .status(400)
    .send(apiErrorResult(`Bad request: ${reason}`, content, 400));
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
) {
  res.status(401);
  return res.send(apiErrorResult(message, null, 401));
}

export function send404(res: Response) {
  res.status(404);
  return res.send(apiErrorResult('Not Found', null, 404));
}

export function clearRequestCache(req: Request, res: Response) {
  const requestID = res.locals.requestID!;
  clearSessionCache(requestID);
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

export function addServiceResultHandler(
  res: Response,
  servicePromise: Promise<any>,
  serviceName: string
) {
  if (IS_DEBUG) {
    console.log(
      'Service-controller: adding service result handler for ',
      serviceName
    );
  }
  return servicePromise.then((data) => {
    sendMessage(res, serviceName, 'message', data);
    if (IS_DEBUG) {
      console.log(
        'Service-controller: service result message sent for',
        serviceName
      );
    }
    return data;
  });
}

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

export function decodeToken<T extends Record<string, string> = {}>(
  jwtToken: string
): T {
  return jose.decodeJwt(jwtToken) as unknown as T;
}

export function nocache(_req: Request, res: Response, next: NextFunction) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
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
  params?: Record<string, string>,
  baseUrl: string = BFF_API_BASE_URL
) {
  return `${baseUrl}${generatePath(path, params)}`;
}

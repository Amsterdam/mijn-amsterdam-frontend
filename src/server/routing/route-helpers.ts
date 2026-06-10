import { HttpStatusCode } from 'axios';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { generatePath } from 'react-router';
import z from 'zod';

import { IS_PRODUCTION } from '../../universal/config/env.ts';
import {
  type ApiResponse,
  apiErrorResult,
} from '../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../auth/auth-types.ts';
import {
  BFF_API_ADMIN_BASE_URL,
  BFF_API_BASE_URL,
  MA_FRONTEND_URL,
} from '../config/app.ts';

function nextRouter(_req: Request, _res: Response, next: NextFunction) {
  next('router');
}

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
    router.use(nextRouter);
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
  T extends ParamsDictionary = RecordStr2,
  T2 extends ParamsDictionary = RecordStr2,
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
  const url = new URL(`${baseUrl}${generatePath(path, pathParams)}${query}`);
  const baseUrl_ = new URL(baseUrl);

  if (url.origin !== baseUrl_.origin) {
    return baseUrl_.href;
  }

  return url.href;
}

export function generateFullApiAdminUrlBFF(
  path: string,
  params?: PathParams | QueryAndOrPathParams
) {
  return generateFullApiUrlBFF(path, params, BFF_API_ADMIN_BASE_URL);
}

export function generateMaFrontendUrl(routePath: string): string {
  const routePath_ = routePath.trim();

  if (!routePath_.startsWith('/')) {
    return MA_FRONTEND_URL;
  }

  const urlWithRoute = new URL(routePath_, MA_FRONTEND_URL);

  // Redundant check to ensure the generated URL is always within the MA_FRONTEND_URL origin.
  if (urlWithRoute.origin !== MA_FRONTEND_URL) {
    return MA_FRONTEND_URL;
  }

  return urlWithRoute.href;
}

/** Sets the right statuscode and sends a response. */
export function sendResponse(
  res: Response,
  apiResponse: ApiResponse<unknown>,
  viewName: string = ''
) {
  if (apiResponse.status === 'ERROR') {
    res.status(
      typeof apiResponse.code === 'number'
        ? apiResponse.code
        : HttpStatusCode.InternalServerError
    );
  }

  return viewName
    ? res.render(viewName, {
        apiResponse,
      })
    : res.send(apiResponse);
}

export function sendResponseHTML(
  res: Response,
  apiResponse: ApiResponse<unknown>,
  viewName: string = 'api-response-html'
) {
  return sendResponse(res, apiResponse, viewName);
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

function appendConditionalDetail(
  baseMessage: string,
  detail?: string,
  shouldAppendDetail: boolean = !IS_PRODUCTION
) {
  return `${baseMessage}${detail && shouldAppendDetail ? `: ${detail}` : ''}`;
}

export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized',
  messageDetails?: string
) {
  return sendResponse(
    res,
    apiErrorResult(
      appendConditionalDetail(message, messageDetails),
      null,
      HttpStatusCode.Unauthorized
    )
  );
}

export function send404(res: Response) {
  return sendResponse(
    res,
    apiErrorResult('Not Found', null, HttpStatusCode.NotFound)
  );
}

export function sendServiceUnavailable(res: Response, messageDetails?: string) {
  return sendResponse(
    res,
    apiErrorResult(
      appendConditionalDetail('Service Unavailable', messageDetails),
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

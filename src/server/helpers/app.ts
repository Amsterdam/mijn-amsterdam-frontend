import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { matchPath } from 'react-router-dom';
import uid from 'uid-safe';
import { AuthType, COOKIE_KEY_AUTH_TYPE } from '../../universal/config';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import {
  BffEndpoints,
  BFF_BASE_PATH,
  PUBLIC_BFF_ENDPOINTS,
  TMA_SAML_HEADER,
  X_AUTH_TYPE_HEADER,
} from '../config';
import { clearSessionCache } from './source-api-request';

export function isValidRequestPath(requestPath: string, path: string) {
  const isRouteMatch = !!matchPath(requestPath, {
    path: BFF_BASE_PATH + path,
    exact: true,
  });
  return isRouteMatch;
}

export function isBffEndpoint(requestPath: string) {
  return Object.values(BffEndpoints).some((path) =>
    isValidRequestPath(requestPath, path)
  );
}

export function isBffPublicEndpoint(requestPath: string) {
  return PUBLIC_BFF_ENDPOINTS.some((path) =>
    isValidRequestPath(requestPath, path)
  );
}

export function getAuthTypeFromHeader(
  passthroughRequestHeaders: Record<string, string>
) {
  const type: AuthType = passthroughRequestHeaders[
    X_AUTH_TYPE_HEADER
  ] as AuthType;

  if (type === AuthType.EHERKENNING) {
    return 'eherkenning';
  }

  return 'digid';
}

export function getPassthroughRequestHeaders(req: Request) {
  const passthroughHeaders: Record<string, string> = {
    [TMA_SAML_HEADER]: (req.headers[TMA_SAML_HEADER] || '') as string,
    [X_AUTH_TYPE_HEADER]: (req.cookies[COOKIE_KEY_AUTH_TYPE] || '') as string,
  };
  return passthroughHeaders;
}

export function exitEarly(req: Request, res: Response, next: NextFunction) {
  // Exit early if request is not made to a bff endpoint.
  if (!isBffEndpoint(req.path)) {
    Sentry.captureMessage('Exit early on non-existent endpoint.', {
      extra: {
        url: req.url,
      },
    });
    return send404(res);
  }
  next();
}

export function sessionID(req: Request, res: Response, next: NextFunction) {
  res.locals.sessionID = uid.sync(18);
  next();
}

export function send404(res: Response) {
  res.status(404);
  return res.end('not found');
}

export function secureValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const passthroughRequestHeaders = getPassthroughRequestHeaders(req);

  // Check if this is a request to a public endpoint
  if (isBffPublicEndpoint(req.path)) {
    next();
  } else {
    // We expect saml token header to be present for non-public endpoint.
    if (passthroughRequestHeaders[TMA_SAML_HEADER]) {
      next();
    } else {
      next(new Error('Saml token required for secure endpoint.'));
    }
  }
}

export function clearSession(req: Request, res: Response, next: NextFunction) {
  const sessionID = res.locals.sessionID!;
  clearSessionCache(sessionID);
  next();
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
  return servicePromise.then((data) => {
    sendMessage(res, serviceName, 'message', data);
    return data;
  });
}

export function queryParams(req: Request) {
  return req.query as Record<string, string>;
}

export function getProfileType(req: Request) {
  return (queryParams(req).profileType as ProfileType) || DEFAULT_PROFILE_TYPE;
}

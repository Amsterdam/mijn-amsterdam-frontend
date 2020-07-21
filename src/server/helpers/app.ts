import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { IS_AP } from '../../universal/config';
import {
  BffEndpoints,
  BFF_BASE_PATH,
  DEV_USER_TYPE_HEADER,
  PUBLIC_BFF_ENDPOINTS,
  TMA_SAML_HEADER,
} from '../config';
import { clearSessionCache } from './source-api-request';
import uid from 'uid-safe';

export function isValidRequestPath(requestPath: string, path: string) {
  return (
    requestPath === `${BFF_BASE_PATH}${path}` ||
    `${BFF_BASE_PATH}/commercial/${path}`
  );
}

export function isBffEndpoint(requestPath: string) {
  return Object.values(BffEndpoints).some(path =>
    isValidRequestPath(requestPath, path)
  );
}

export function isBffPublicEndpoint(requestPath: string) {
  return PUBLIC_BFF_ENDPOINTS.some(path =>
    isValidRequestPath(requestPath, path)
  );
}

export function getPassthroughRequestHeaders(req: Request) {
  const passthroughHeaders: Record<string, string> = {
    [TMA_SAML_HEADER]: (req.headers[TMA_SAML_HEADER] || '') as string,
  };
  if (!IS_AP) {
    passthroughHeaders[DEV_USER_TYPE_HEADER] = (req.headers[
      DEV_USER_TYPE_HEADER
    ] || '') as string;
  }
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
  uid(18, function generateSessionIdFromUid(err: Error, sessionID: string) {
    if (err) {
      next(err);
    }
    res.locals.sessionID = sessionID;
    next();
  });
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
  data: any
) {
  const doStringify = typeof data !== 'string';
  const payload = doStringify ? JSON.stringify(data) : data;
  const message = `event: ${event}\nid: ${id}\ndata: ${payload}\n\n`;
  res.write(message);
  res.flush();
}

export function addServiceResultHandler(
  res: Response,
  servicePromise: Promise<any>,
  serviceName: string
) {
  return servicePromise
    .then(data => {
      sendMessage(res, serviceName, 'message', data);
      return data;
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName },
      })
    );
}

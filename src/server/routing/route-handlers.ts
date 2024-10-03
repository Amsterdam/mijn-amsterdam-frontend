import { NextFunction, Request, Response } from 'express';
import uid from 'uid-safe';

import { isProtectedRoute, sendUnauthorized } from './route-helpers';
import { apiSuccessResult } from '../../universal/helpers/api';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';
import {
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
} from '../auth/auth-helpers';
import { clearSessionCache } from '../helpers/source-api-request';
import { getIsBlackListed } from '../services/session-blacklist';

export function handleCheckProtectedRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip router if we've entered a public route.
  if (!isProtectedRoute(req.path)) {
    return next('router');
  }
  return next();
}

export async function isBlacklistedHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = getAuth(req);

  if (auth?.profile?.sid) {
    const isOnList = await getIsBlackListed(auth.profile.sid);
    if (isOnList) {
      return sendUnauthorized(res);
    }
  }

  return next();
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (hasSessionCookie(req) && getAuth(req)) {
    return next();
  }
  return sendUnauthorized(res);
}

export function verifyAuthenticated(
  authMethod: AuthMethod,
  profileType: ProfileType
) {
  return async (req: Request, res: Response) => {
    if (await isRequestAuthenticated(req, authMethod)) {
      return res.send(
        apiSuccessResult({
          isAuthenticated: true,
          profileType,
          authMethod,
        })
      );
    }
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  };
}

export function apiKeyVerificationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-api-key'] as string;

  const externalKeys: Array<string | undefined> = [
    process.env.BFF_EXTERNAL_CONSUMER_API_KEY_1,
    process.env.BFF_EXTERNAL_CONSUMER_API_KEY_2,
  ];

  if (apiKey && externalKeys.includes(apiKey)) {
    return next();
  }

  return sendUnauthorized(res, 'Api key ongeldig');
}

export function nocache(_req: Request, res: Response, next: NextFunction) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

export function requestID(req: Request, res: Response, next: NextFunction) {
  const byteLength = 18;
  res.locals.requestID = uid.sync(byteLength);
  next();
}

export function clearRequestCache(req: Request, res: Response) {
  const requestID = res.locals.requestID!;
  clearSessionCache(requestID);
}

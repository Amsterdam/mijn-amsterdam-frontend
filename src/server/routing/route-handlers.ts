import { NextFunction, Request, Response } from 'express';
import uid from 'uid-safe';

import { isProtectedRoute, sendUnauthorized } from './route-helpers';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  destroySession,
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
} from '../auth/auth-helpers';
import { AuthenticatedRequest } from '../auth/auth-types';
import { clearSessionCache } from '../helpers/source-api-request';

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

export async function handleRefresh(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.oidc.accessToken?.isExpired?.()) {
    // Assigns the newly aquired access_token to the oidc context.
    await req.oidc.accessToken?.refresh?.();
  }
  next();
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
  return async (req: AuthenticatedRequest, res: Response) => {
    if (await isRequestAuthenticated(req, authMethod)) {
      const auth = getAuth(req);
      if (auth) {
        return res.send(
          apiSuccessResult({
            isAuthenticated: true,
            profileType,
            authMethod,
            expiresAt: auth.expiresAt,
          })
        );
      }
    }
    destroySession(req, res);
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

export function requestID(_req: Request, res: Response, next: NextFunction) {
  const REQUEST_ID_BYTE_LENGTH = 18;
  res.locals.requestID = uid.sync(REQUEST_ID_BYTE_LENGTH);
  next();
}

export function clearRequestCache(_req: Request, res: Response) {
  const requestID = res.locals.requestID!;
  clearSessionCache(requestID);
}

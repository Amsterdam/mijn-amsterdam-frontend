import { NextFunction, Request, Response } from 'express';
import { apiSuccessResult } from '../../universal/helpers/api';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';
import {
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
} from '../auth/auth-helpers';
import { sendUnauthorized } from '../helpers/app';
import { captureMessage } from '../services/monitoring';
import { isBlacklisted } from '../services/session-blacklist';

export async function isBlacklistedHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = await getAuth(req);
  if (auth.profile.sid) {
    const isOnList = await isBlacklisted(auth.profile.sid);
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
  if (hasSessionCookie(req)) {
    try {
      await getAuth(req);
      return next();
    } catch (error) {
      captureMessage('Not authenticated: Session cookie invalid', {
        severity: 'warning',
      });
    }
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

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import uid from 'uid-safe';

import {
  isProtectedRoute,
  sendServiceUnavailable,
  sendUnauthorized,
  type ResponseAuthenticated,
} from './route-helpers';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  destroySession,
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
} from '../auth/auth-helpers';
import { AuthenticatedRequest } from '../auth/auth-types';
import { getFromEnv } from '../helpers/env';
import { captureException } from '../services/monitoring';

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

export async function handleIsAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authProfileAndToken = getAuth(req);
  if (hasSessionCookie(req) && authProfileAndToken) {
    // Assigns locals for use in later route handlers.
    // We cast to ResponseAuthenticated here, as we know authProfileAndToken exists.
    const resAuthenticated = res as ResponseAuthenticated;
    resAuthenticated.locals.authProfileAndToken = authProfileAndToken;
    resAuthenticated.locals.userID = authProfileAndToken.profile.id;
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
            expiresAtMilliseconds: auth.expiresAtMilliseconds,
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

async function fetchSigningKey(issuer: string) {
  const keyId = getFromEnv('BFF_OAUTH_KEY_ID');
  if (!keyId) {
    return null;
  }
  const client = jwksClient({
    jwksUri: `${issuer}/discovery/keys`,
  });
  const signingKey = await client.getSigningKey(keyId);
  return signingKey.getPublicKey();
}

export function OAuthVerificationHandler(role?: string) {
  return async function OAuthVerificationHandler(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return sendUnauthorized(res, 'Missing Authorization header');
    }
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return sendUnauthorized(res, 'Malformed Authorization header');
    }
    const token = authHeader.split(' ')[1]; // Removes bearer/Bearer prefix
    const tenantId = getFromEnv('BFF_OAUTH_TENANT');
    const audience = getFromEnv('BFF_OAUTH_MIJNADAM_CLIENT_ID');
    if (!token || !tenantId || !audience) {
      return sendServiceUnavailable(res);
    }
    const issuer = `https://sts.windows.net/${tenantId}`;
    const signingKey = await fetchSigningKey(issuer).catch((error) =>
      captureException(error)
    );
    if (!signingKey) {
      return sendServiceUnavailable(res);
    }

    jwt.verify(
      token,
      signingKey,
      {
        audience,
        issuer: `${issuer}/`,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (error) {
          captureException(error);
          return sendUnauthorized(res);
        }
        const payload = decoded as { roles?: string[] };
        if (role && !payload.roles?.includes?.(role)) {
          return sendUnauthorized(res);
        }
        next();
      }
    );
  };
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

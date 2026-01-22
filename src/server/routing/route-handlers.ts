import { NextFunction, Request, Response } from 'express';
import jwt, { type GetPublicKeyOrSecret } from 'jsonwebtoken';
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
  const apiKey = req.headers['x-api-key'] as string | undefined;

  const externalKeys: Array<string | undefined> = [
    getFromEnv('BFF_EXTERNAL_CONSUMER_API_KEY_1'),
    getFromEnv('BFF_EXTERNAL_CONSUMER_API_KEY_2'),
  ];

  if (apiKey && externalKeys.includes(apiKey)) {
    return next();
  }

  return sendUnauthorized(res, 'Api key ongeldig');
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
      return sendServiceUnavailable(
        res,
        `OAuth configuration incomplete - ${!token ? 'token missing from auth header' : ''}${!tenantId ? ' tenantId missing in env' : ''}${!audience ? ' audience missing in env' : ''}`
      );
    }
    const issuer = `https://sts.windows.net/${tenantId}`;
    const client = jwksClient({
      jwksUri: `${issuer}/discovery/keys`,
    });

    const getKey: GetPublicKeyOrSecret = (
      header: { kid?: string },
      callback: (err: Error | null, key?: string) => void
    ) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err || !key) {
          return callback(err || null);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    };

    jwt.verify(
      token,
      getKey,
      {
        audience,
        issuer: `${issuer}/`,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (error) {
          captureException(error);
          return sendUnauthorized(
            res,
            `Unauthorized: OAuth token verification error: ${error.message}`
          );
        }
        const payload = decoded as { roles?: string[] };
        if (role && !payload.roles?.includes?.(role)) {
          return sendUnauthorized(
            res,
            `Unauthorized: OAuth token missing required role`
          );
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

import { createPublicKey } from 'node:crypto';

import type { NextFunction, Request, Response } from 'express';
import { decodeProtectedHeader, jwtVerify } from 'jose';
import jwksClient from 'jwks-rsa';
import uid from 'uid-safe';

import {
  sendServiceUnavailable,
  sendUnauthorized,
  type ResponseAuthenticated,
} from './route-helpers.ts';
import { apiSuccessResult } from '../../universal/helpers/api.ts';
import {
  destroySession,
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
} from '../auth/auth-helpers.ts';
import type { AuthenticatedRequest } from '../auth/auth-types.ts';
import { getFromEnv } from '../helpers/env.ts';
import { captureException } from '../services/monitoring.ts';

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
      const missing: string[] = [];
      if (!token) {
        missing.push('token missing from auth header');
      }
      if (!tenantId) {
        missing.push('tenantId missing in env');
      }
      if (!audience) {
        missing.push('audience missing in env');
      }
      return sendServiceUnavailable(
        res,
        `OAuth configuration incomplete - ${missing.join('; ')}`
      );
    }
    const issuer = `https://sts.windows.net/${tenantId}`;
    const client = jwksClient({
      jwksUri: `${issuer}/discovery/keys`,
    });

    const getSigningKey = async (kid: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        client.getSigningKey(kid, (err, key) => {
          if (err || !key) {
            return reject(err || new Error('Signing key not found'));
          }
          resolve(key.getPublicKey());
        });
      });
    };

    try {
      const { kid } = decodeProtectedHeader(token);
      if (!kid) {
        throw new Error('No kid found in token header');
      }

      const signingKey = await getSigningKey(kid);
      const publicKey = createPublicKey(signingKey);

      const { payload } = await jwtVerify<{ roles?: string[] }>(
        token,
        publicKey,
        {
          audience,
          issuer: `${issuer}/`,
          algorithms: ['RS256'],
        }
      );

      if (role && !payload.roles?.includes?.(role)) {
        return sendUnauthorized(
          res,
          `Unauthorized`,
          `Required role '${role}' not present in token`
        );
      }

      return next();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      captureException(error);
      return sendUnauthorized(
        res,
        `Unauthorized`,
        `OAuth token verification error: ${error.message}`
      );
    }
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

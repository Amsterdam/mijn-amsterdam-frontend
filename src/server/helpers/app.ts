import * as Sentry from '@sentry/node';
import axios, { AxiosRequestConfig } from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { AccessToken } from 'express-openid-connect';
import * as jose from 'jose';
import memoize from 'memoizee';
import { matchPath } from 'react-router-dom';
import uid from 'uid-safe';
import { IS_AP } from '../../universal/config';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import { apiErrorResult, apiSuccessResult } from '../../universal/helpers';
import {
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_ID_TOKEN_EXP,
  OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_TOKEN_ID_ATTRIBUTE,
  PUBLIC_BFF_ENDPOINTS,
  RelayPathsAllowed,
  TOKEN_ID_ATTRIBUTE,
  TokenIdAttribute,
  oidcConfigDigid,
  oidcConfigEherkenning,
  oidcConfigYivi,
} from '../config';
import { getPublicKeyForDevelopment } from './app.development';
import { axiosRequest, clearSessionCache } from './source-api-request';
import { createSecretKey } from 'node:crypto';

const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid' | 'yivi';
  profileType: ProfileType;
  id?: string;
  sid?: string; // TMA Session ID
}

export function getAuthProfile(tokenData: TokenData): AuthProfile {
  let authMethod: AuthProfile['authMethod'];
  let profileType: AuthProfile['profileType'];

  switch (tokenData.aud) {
    case oidcConfigEherkenning.clientID:
      authMethod = 'eherkenning';
      profileType = 'commercial';
      break;
    case oidcConfigYivi.clientID:
      authMethod = 'yivi';
      profileType = 'private-attributes';
      break;
    case oidcConfigDigid.clientID:
    default:
      authMethod = 'digid';
      profileType = 'private';
      break;
  }

  const idAttr = OIDC_TOKEN_ID_ATTRIBUTE[authMethod](tokenData);

  return {
    id: tokenData[idAttr],
    sid: tokenData.sid,
    authMethod,
    profileType,
  };
}

export interface AuthProfileAndToken {
  token: string;
  profile: AuthProfile;
}

async function getAuth_(req: Request): Promise<AuthProfileAndToken> {
  const combinedCookies = combineCookieChunks(req.cookies);
  const oidcToken = await getOIDCToken(combinedCookies);
  const tokenData = await decodeOIDCToken(oidcToken);
  const profile = getAuthProfile(tokenData);

  return {
    token: oidcToken,
    profile,
  };
}

export const getAuth = memoize(getAuth_);

export function combineCookieChunks(cookies: Record<string, string>) {
  let unchunked = '';

  Object.entries(cookies)
    .filter(([key]) => isSessionCookieName(key))
    .forEach(([key, value]) => {
      unchunked += value;
    });

  return unchunked;
}

export function isSessionCookieName(cookieName: string) {
  return (
    cookieName === OIDC_SESSION_COOKIE_NAME ||
    !!cookieName.match(`^${OIDC_SESSION_COOKIE_NAME}\\.\\d$`)
  );
}

export function hasSessionCookie(req: Request) {
  for (const cookieName of Object.keys(req.cookies)) {
    if (isSessionCookieName(cookieName)) {
      return true;
    }
  }
  return false;
}

export function requestID(req: Request, res: Response, next: NextFunction) {
  res.locals.requestID = uid.sync(18);
  next();
}

export function send404(res: Response) {
  res.status(404);
  return res.send(apiErrorResult('Not Found', null));
}

export function sendUnauthorized(res: Response) {
  res.status(401);
  return res.send(apiErrorResult('Unauthorized', null));
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
  return servicePromise.then((data) => {
    sendMessage(res, serviceName, 'message', data);
    return data;
  });
}

export function queryParams(req: Request) {
  return req.query as Record<string, string>;
}

export async function getProfileType(req: Request): Promise<ProfileType> {
  const auth = await getAuth(req);
  const profileType = auth.profile.profileType;
  return profileType || DEFAULT_PROFILE_TYPE;
}

export async function getOIDCCookieData(jweCookieString: string): Promise<{
  id_token: string;
}> {
  const key = await createSecretKey(deriveKey(OIDC_COOKIE_ENCRYPTION_KEY));

  const encryptOpts = {
    alg: 'dir',
    enc: 'A256GCM',
  };

  const options: jose.DecryptOptions = {
    contentEncryptionAlgorithms: [encryptOpts.enc],
    keyManagementAlgorithms: [encryptOpts.alg],
  };

  const { plaintext, protectedHeader } = await jose.compactDecrypt(
    jweCookieString,
    key,
    options
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

export async function getOIDCToken(jweCookieString: string): Promise<string> {
  const cookie = await getOIDCCookieData(jweCookieString);
  return cookie.id_token;
}

export interface TokenData {
  sub: string;
  aud: string;
  sid: string;
  [key: string]: any;
}

const getJWK = memoize(async () => {
  if (IS_AP) {
    const jwksUrl = process.env.BFF_OIDC_JWKS_URL;
    if (!jwksUrl) {
      throw new Error('BFF_OIDC_JWKS_URL env value not provided.');
    }
    return axiosRequest
      .request({
        url: process.env.BFF_OIDC_JWKS_URL,
        responseType: 'json',
      })
      .then((response) => jose.importJWK(response.data.keys[0]));
  }

  return getPublicKeyForDevelopment();
});

export async function decodeOIDCToken(token: string): Promise<TokenData> {
  const verificationOptions: jose.JWTVerifyOptions = {
    clockTolerance: '2 minutes',
  };

  if (OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED) {
    // NOTE: Use this for added security
    verificationOptions.maxTokenAge = OIDC_ID_TOKEN_EXP;
  }

  const jwksKey = await getJWK();
  const verified = await jose.jwtVerify(token, jwksKey, verificationOptions);

  return verified.payload as unknown as TokenData;
}

export function isRelayAllowed(pathRequested: string) {
  return Object.values(RelayPathsAllowed).some((pathAllowed) => {
    return matchPath(pathRequested, {
      path: pathAllowed,
      exact: true,
      strict: false,
    });
  });
}

export function isProtectedRoute(pathRequested: string) {
  // NOT A PUBLIC ENDPOINT
  return !PUBLIC_BFF_ENDPOINTS.some((pathPublic) => {
    return matchPath(pathRequested, {
      path: pathPublic,
      exact: true,
      strict: false,
    });
  });
}

export async function verifyUserIdWithRemoteUserinfo(
  authMethod: AuthMethod,
  accessToken?: AccessToken,
  userID?: string
) {
  if (!accessToken || !userID) {
    return false;
  }

  const requestOptions: AxiosRequestConfig = {
    method: 'get',
    url: process.env.BFF_OIDC_USERINFO_ENDPOINT,
    headers: {
      Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
      Accept: 'application/jwt',
    },
  };

  try {
    const response = await axios(requestOptions);
    let decoded: Record<TokenIdAttribute, string> = decodeToken(
      response.data.toString()
    );
    return decoded[TOKEN_ID_ATTRIBUTE[authMethod]] === userID;
  } catch (error) {
    Sentry.captureException(error);
  }
  return false;
}

export async function isRequestAuthenticated(
  req: Request,
  authMethod: AuthMethod
) {
  try {
    if (req.oidc.isAuthenticated()) {
      const auth = await getAuth(req);
      return (
        auth.profile.authMethod === authMethod &&
        (await verifyUserIdWithRemoteUserinfo(
          authMethod,
          req.oidc.accessToken,
          auth.profile.id
        ))
      );
    }
  } catch (error) {
    Sentry.captureException(error);
  }
  return false;
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
      Sentry.captureException(error);
    }
  }
  return sendUnauthorized(res);
}

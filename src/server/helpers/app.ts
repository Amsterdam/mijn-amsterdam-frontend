import { NextFunction, Request, Response } from 'express';
import jose, { JWE, JWK, JWKS } from 'jose';

import { matchPath } from 'react-router-dom';
import uid from 'uid-safe';
import { IS_AP } from '../../universal/config';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import { apiErrorResult } from '../../universal/helpers';
import {
  DEV_JWK_PRIVATE,
  DEV_JWK_PUBLIC,
  oidcConfigDigid,
  oidcConfigEherkenning,
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  OIDC_TOKEN_ID_ATTRIBUTE,
  PUBLIC_BFF_ENDPOINTS,
  RelayPathsAllowed,
} from '../config';
import { axiosRequest, clearSessionCache } from './source-api-request';
import memoize from 'memoizee';
import addSeconds from 'date-fns/addSeconds';

const { encryption: deriveKey } = require('express-openid-connect/lib/hkdf');

export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid';
  profileType: 'private' | 'private-commercial' | 'commercial';
}

export function getAuthProfile(tokenData: TokenData): AuthProfile {
  let authMethod: AuthProfile['authMethod'];
  let profileType: AuthProfile['profileType'];

  switch (tokenData.aud) {
    case oidcConfigEherkenning.clientID:
      authMethod = 'eherkenning';
      profileType = 'commercial';
      break;
    case oidcConfigDigid.clientID:
    default:
      authMethod = 'digid';
      profileType = 'private';
      break;
  }

  return {
    authMethod,
    profileType,
  };
}

export interface AuthProfileAndToken {
  token: string;
  profile: AuthProfile;
  validUntil?: number;
}

async function getAuth_(req: Request): Promise<AuthProfileAndToken> {
  const oidcToken = getOIDCToken(combineCookieChunks(req.cookies));
  const tokenData = await decodeOIDCToken(oidcToken);
  const profile = getAuthProfile(tokenData);

  return {
    token: oidcToken,
    profile,
    validUntil: addSeconds(
      new Date(tokenData.iat * 1000),
      OIDC_SESSION_MAX_AGE_SECONDS
    ).getTime(),
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

export function clearRequestCache(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestID = res.locals.requestID!;
  clearSessionCache(requestID);
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

export function getOIDCCookieData(jweCookieString: string): {
  id_token: string;
} {
  const key = JWK.asKey(deriveKey(OIDC_COOKIE_ENCRYPTION_KEY));

  const encryptOpts = {
    alg: 'dir',
    enc: 'A256GCM',
  };

  const { cleartext } = JWE.decrypt(jweCookieString, key, {
    complete: true,
    contentEncryptionAlgorithms: [encryptOpts.enc],
    keyManagementAlgorithms: [encryptOpts.alg],
  });

  return JSON.parse(cleartext.toString());
}

export function getOIDCToken(jweCookieString: string): string {
  return getOIDCCookieData(jweCookieString).id_token;
}

export interface TokenData {
  sub: string;
  aud: string;
  [key: string]: any;
}

const getJWKSKey = memoize(async () => {
  return IS_AP
    ? axiosRequest
        .request({
          url: process.env.BFF_OIDC_JWKS_URL,
          responseType: 'json',
        })
        .then((response) => JWKS.asKeyStore(response.data))
    : getPublicKeyForDevelopment();
});

export async function decodeOIDCToken(token: string): Promise<TokenData> {
  return jose.JWT.verify(token, await getJWKSKey(), {
    maxTokenAge: `${OIDC_SESSION_MAX_AGE_SECONDS} seconds`,
  } as any) as unknown as TokenData;
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

/**
 *
 * Helpers for development
 */

function encryptDevSessionCookieValue(payload: string, headers: object) {
  const alg = 'dir';
  const enc = 'A256GCM';
  const key = JWK.asKey(deriveKey(OIDC_COOKIE_ENCRYPTION_KEY));

  return JWE.encrypt(payload, key, { alg, enc, ...headers });
}

function getPrivateKeyForDevelopment() {
  const key = JWK.asKey(DEV_JWK_PRIVATE);
  return key;
}

function getPublicKeyForDevelopment() {
  return JWK.asKey(DEV_JWK_PUBLIC);
}

export function generateDevSessionCookieValue(
  authMethod: AuthProfile['authMethod'],
  userID: string
) {
  const uat = (Date.now() / 1000) | 0;
  const iat = uat;
  const exp = iat + OIDC_SESSION_MAX_AGE_SECONDS;
  const idToken = jose.JWT.sign(
    {
      [OIDC_TOKEN_ID_ATTRIBUTE[authMethod]]: userID,
      aud: OIDC_TOKEN_AUD_ATTRIBUTE_VALUE[authMethod],
    },
    getPrivateKeyForDevelopment(),
    {
      algorithm: 'RS256',
    }
  );

  const value = encryptDevSessionCookieValue(
    JSON.stringify({ id_token: idToken }),
    {
      iat,
      uat,
      exp,
    }
  );

  return value;
}

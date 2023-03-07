import { NextFunction, Request, Response } from 'express';
import jose, { JWE, JWK, JWKS } from 'jose';
import memoize from 'memoizee';
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
  oidcConfigYivi,
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_ID_TOKEN_EXP,
  OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  OIDC_TOKEN_ID_ATTRIBUTE,
  PUBLIC_BFF_ENDPOINTS,
  RelayPathsAllowed,
} from '../config';
import { axiosRequest, clearSessionCache } from './source-api-request';

const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid' | 'yivi';
  profileType: ProfileType;
  id?: string;
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
      profileType = 'private';
      break;
    case oidcConfigDigid.clientID:
    default:
      authMethod = 'digid';
      profileType = 'private';
      break;
  }

  return {
    id: tokenData[OIDC_TOKEN_ID_ATTRIBUTE[authMethod]],
    authMethod,
    profileType,
  };
}

export interface AuthProfileAndToken {
  token: string;
  profile: AuthProfile;
}

async function getAuth_(req: Request): Promise<AuthProfileAndToken> {
  const oidcToken = getOIDCToken(combineCookieChunks(req.cookies));
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
  const verificationOptions = {} as any;

  if (OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED) {
    // NOTE: Use this for added security
    verificationOptions.maxTokenAge = OIDC_ID_TOKEN_EXP;
  }

  return jose.JWT.verify(
    token,
    await getJWKSKey(),
    verificationOptions
  ) as unknown as TokenData;
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

function signToken(authMethod: AuthProfile['authMethod'], userID: string) {
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
  return idToken;
}

export function decodeToken(idToken: string) {
  return jose.JWT.decode(idToken);
}

export function generateDevSessionCookieValue(
  authMethod: AuthProfile['authMethod'],
  userID: string
) {
  const uat = (Date.now() / 1000) | 0;
  const iat = uat;
  const exp = iat + OIDC_SESSION_MAX_AGE_SECONDS;

  const value = encryptDevSessionCookieValue(
    JSON.stringify({ id_token: signToken(authMethod, userID) }),
    {
      iat,
      uat,
      exp,
    }
  );

  return value;
}

export function nocache(req: Request, res: Response, next: NextFunction) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

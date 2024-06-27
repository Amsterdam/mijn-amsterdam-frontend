import axios, { AxiosRequestConfig } from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { AccessToken } from 'express-openid-connect';
import * as jose from 'jose';
import memoize from 'memoizee';
import { createSecretKey, hkdfSync } from 'node:crypto';
import { generatePath, matchPath } from 'react-router-dom';
import uid from 'uid-safe';
import { IS_AP } from '../../universal/config';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import {
  ApiResponse,
  apiErrorResult,
  apiSuccessResult,
} from '../../universal/helpers';
import {
  BFF_API_BASE_URL,
  IS_DEBUG,
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_ID_TOKEN_EXP,
  OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_TOKEN_ID_ATTRIBUTE,
  PUBLIC_BFF_ENDPOINTS,
  TOKEN_ID_ATTRIBUTE,
  TokenIdAttribute,
  oidcConfigDigid,
  oidcConfigEherkenning,
} from '../config';
import { getPublicKeyForDevelopment } from './app.development';
import { axiosRequest, clearSessionCache } from './source-api-request';
import { captureException, captureMessage } from '../services/monitoring';

// const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

export interface AuthProfile {
  authMethod: 'eherkenning' | 'digid';
  profileType: ProfileType;
  id: string; // User id (bsn/kvknr)
  sid: string; // TMA Session ID
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
  if (IS_DEBUG) {
    console.log(
      'Service-controller: adding service result handler for ',
      serviceName
    );
  }
  return servicePromise.then((data) => {
    sendMessage(res, serviceName, 'message', data);
    if (IS_DEBUG) {
      console.log(
        'Service-controller: service result message sent for',
        serviceName
      );
    }
    return data;
  });
}

export function queryParams<T extends Record<string, any>>(req: Request) {
  return req.query as T;
}

export async function getProfileType(req: Request): Promise<ProfileType> {
  const auth = await getAuth(req);
  const profileType = auth.profile.profileType;
  return profileType || DEFAULT_PROFILE_TYPE;
}

export function createCookieEncriptionKey() {
  const BYTE_LENGTH = 32;
  const ENCRYPTION_INFO = 'JWE CEK';
  const DIGEST = 'sha256';

  const k = Buffer.from(
    hkdfSync(
      DIGEST,
      OIDC_COOKIE_ENCRYPTION_KEY,
      Buffer.alloc(0),
      ENCRYPTION_INFO,
      BYTE_LENGTH
    )
  );
  return createSecretKey(k);
}

const encryptOpts = {
  alg: 'dir',
  enc: 'A256GCM',
};

export const encryptionKey = createCookieEncriptionKey();

export async function encryptCookieValue(payload: string, headers: object) {
  const jwe = await new jose.CompactEncrypt(new TextEncoder().encode(payload))
    .setProtectedHeader({ ...encryptOpts, ...headers })
    .encrypt(encryptionKey);

  return jwe;
}

export async function decryptCookieValue(cookieValueEncrypted: string) {
  const options: jose.DecryptOptions = {
    contentEncryptionAlgorithms: [encryptOpts.enc],
    keyManagementAlgorithms: [encryptOpts.alg],
  };

  const { plaintext, protectedHeader } = await jose.compactDecrypt(
    cookieValueEncrypted,
    encryptionKey,
    options
  );

  return plaintext.toString();
}

export async function getOIDCCookieData(cookieValueEncrypted: string): Promise<{
  id_token: string;
}> {
  const decryptedCookieValue = await decryptCookieValue(cookieValueEncrypted);
  return JSON.parse(decryptedCookieValue);
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
    if (!response.data) {
      return false;
    }
    const decoded: Record<TokenIdAttribute, string> = decodeToken(
      response.data.toString()
    );
    return decoded[TOKEN_ID_ATTRIBUTE[authMethod]] === userID;
  } catch (error) {
    captureException(error);
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
    console.error(error);
    captureException(error);
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
      captureMessage('Not authenticated: Session cookie invalid', {
        severity: 'warning',
      });
    }
  }
  return sendUnauthorized(res);
}

export function generateFullApiUrlBFF(
  path: string,
  params?: Record<string, string>
) {
  return `${BFF_API_BASE_URL}${generatePath(path, params)}`;
}

export function sendResponseContent(res: Response, apiResponse: ApiResponse) {
  if (apiResponse.status === 'ERROR' && apiResponse.code) {
    res.status(apiResponse.code);
  }
  return res.send(apiResponse);
}

import { NextFunction, Request, Response } from 'express';
import jose, { JWE, JWK } from 'jose';
import { matchPath } from 'react-router-dom';
import uid from 'uid-safe';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import { apiErrorResult } from '../../universal/helpers';
import {
  oidcConfigDigid,
  oidcConfigEherkenning,
  OIDC_SECRET,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  PUBLIC_BFF_ENDPOINTS,
  RelayPathsAllowed,
} from '../config';
import { clearSessionCache } from './source-api-request';

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
}

export function getAuth(req: Request): AuthProfileAndToken {
  const token = getOIDCToken(req.cookies[OIDC_SESSION_COOKIE_NAME]);
  const tokenData = decodeOIDCToken(token);
  const profile = getAuthProfile(tokenData);

  return {
    token,
    profile,
  };
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

export function getOIDCToken(jwe: string): string {
  const key = JWK.asKey(deriveKey(OIDC_SECRET));
  const encryptOpts = {
    alg: 'dir',
    enc: 'A256GCM',
  };
  const { cleartext } = JWE.decrypt(jwe, key, {
    complete: true,
    contentEncryptionAlgorithms: [encryptOpts.enc],
    keyManagementAlgorithms: [encryptOpts.alg],
  });

  return JSON.parse(cleartext.toString()).id_token;
}

export interface TokenData {
  sub: string;
  aud: string;
  [key: string]: any;
}

export function decodeOIDCToken(token: string): TokenData {
  return jose.JWT.verify(token, OIDC_SECRET) as unknown as TokenData;
}

interface DevSessionData {
  sub: number | string;
  aud: string;
}

function encrypt(payload: string, headers: object) {
  const alg = 'dir';
  const enc = 'A256GCM';
  const key = JWK.asKey(deriveKey(OIDC_SECRET));

  return JWE.encrypt(payload, key, { alg, enc, ...headers });
}

export function generateDevSessionCookieValue({ sub, aud }: DevSessionData) {
  const uat = (Date.now() / 1000) | 0;
  const iat = uat;
  const exp = iat + OIDC_SESSION_MAX_AGE_SECONDS;
  const idToken = jose.JWT.sign({ sub, aud }, OIDC_SECRET);
  const value = encrypt(JSON.stringify({ id_token: idToken }), {
    iat,
    uat,
    exp,
  });

  return value;
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

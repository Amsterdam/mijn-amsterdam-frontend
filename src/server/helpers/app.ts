import { NextFunction, Request, Response } from 'express';
import jose, { JWE, JWK } from 'jose';
import uid from 'uid-safe';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import {
  oidcConfigDigid,
  oidcConfigEherkenning,
  OIDC_SESSION_COOKIE_NAME,
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

export function sessionID(req: Request, res: Response, next: NextFunction) {
  res.locals.sessionID = uid.sync(18);
  next();
}

export function send404(res: Response) {
  res.status(404);
  return res.end('not found');
}

export function clearSession(req: Request, res: Response, next: NextFunction) {
  const sessionID = res.locals.sessionID!;
  clearSessionCache(sessionID);
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
  const key = JWK.asKey(deriveKey(process.env.BFF_OIDC_SECRET));
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

interface TokenData {
  sub: string;
  aud: string;
  [key: string]: any;
}

export function decodeOIDCToken(token: string): TokenData {
  const key = JWK.asKey(deriveKey(process.env.BFF_OIDC_SECRET));
  return jose.JWT.verify(token, key) as TokenData;
}

import jose, { JWE, JWK } from 'jose';
import {
  DEV_JWK_PRIVATE,
  DEV_JWK_PUBLIC,
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  DEV_TOKEN_ID_ATTRIBUTE,
} from '../config';
import type { AuthProfile } from './app';

const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

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

export function getPrivateKeyForDevelopment() {
  const key = JWK.asKey(DEV_JWK_PRIVATE);
  return key;
}

export function getPublicKeyForDevelopment() {
  return JWK.asKey(DEV_JWK_PUBLIC);
}

export function signDevelopmentToken(
  authMethod: AuthProfile['authMethod'],
  userID: string
) {
  const idToken = jose.JWT.sign(
    {
      [DEV_TOKEN_ID_ATTRIBUTE[authMethod]]: userID,
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
    JSON.stringify({ id_token: signDevelopmentToken(authMethod, userID) }),
    {
      iat,
      uat,
      exp,
    }
  );

  return value;
}

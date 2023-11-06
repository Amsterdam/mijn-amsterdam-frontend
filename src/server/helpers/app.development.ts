import * as jose from 'jose';
import {
  DEV_JWK_PRIVATE,
  DEV_JWK_PUBLIC,
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  TOKEN_ID_ATTRIBUTE,
} from '../config';
import type { AuthProfile } from './app';
import { createSecretKey } from 'node:crypto';

const { encryption: deriveKey } = require('express-openid-connect/lib/crypto');

/**
 *
 * Helpers for development
 */

async function encryptDevSessionCookieValue(payload: string, headers: object) {
  const alg = 'dir';
  const enc = 'A256GCM';
  const keySource = deriveKey(OIDC_COOKIE_ENCRYPTION_KEY);
  // console.log(keySource);
  const key = await createSecretKey(keySource);
  console.log(key);
  // const secret = new TextEncoder().encode(OIDC_COOKIE_ENCRYPTION_KEY)

  const jwe = await new jose.CompactEncrypt(new TextEncoder().encode(payload))
    .setProtectedHeader({ alg, enc, ...headers })
    .encrypt(key);

  return jwe;
}

export async function getPrivateKeyForDevelopment() {
  return jose.importJWK(DEV_JWK_PRIVATE);
}

export function getPublicKeyForDevelopment(): Promise<jose.KeyLike> {
  return jose.importJWK(DEV_JWK_PUBLIC) as Promise<jose.KeyLike>;
}

export async function signDevelopmentToken(
  authMethod: AuthProfile['authMethod'],
  userID: string
) {
  const data = {
    [TOKEN_ID_ATTRIBUTE[authMethod]]: userID,
    aud: OIDC_TOKEN_AUD_ATTRIBUTE_VALUE[authMethod],
  };
  const alg = 'RS256';
  try {
    const idToken = await new jose.SignJWT(data)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(await getPrivateKeyForDevelopment());
    return idToken;
  } catch (err) {
    console.error(err);
  }
}

export async function generateDevSessionCookieValue(
  authMethod: AuthProfile['authMethod'],
  userID: string
) {
  const uat = (Date.now() / 1000) | 0;
  const iat = uat;
  const exp = iat + OIDC_SESSION_MAX_AGE_SECONDS;

  const value = await encryptDevSessionCookieValue(
    JSON.stringify({
      id_token: await signDevelopmentToken(authMethod, userID),
    }),
    {
      iat,
      uat,
      exp,
    }
  );

  return value;
}

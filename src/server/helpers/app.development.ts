import * as jose from 'jose';
import { IS_TEST } from '../../universal/config/env';
import {
  DEV_JWK_PRIVATE,
  DEV_JWK_PUBLIC,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  TOKEN_ID_ATTRIBUTE,
} from '../config';
import { encryptCookieValue, type AuthProfile } from './app';

const TMA_LONG_LIVED_ID_TOKENS =
  IS_TEST && process.env.TMA_LONG_LIVED_ID_TOKENS
    ? process.env.TMA_LONG_LIVED_ID_TOKENS.split(',').reduce(
        (acc, userToken) => {
          const [user, token] = userToken.split('=');
          acc[user] = token;
          return acc;
        },
        {} as Record<string, string>
      )
    : null;

/**
 *
 * Helpers for development
 */

export async function getPrivateKeyForDevelopment() {
  return jose.importJWK(DEV_JWK_PRIVATE);
}

export function getPublicKeyForDevelopment(): Promise<jose.KeyLike> {
  return jose.importJWK(DEV_JWK_PUBLIC) as Promise<jose.KeyLike>;
}

export async function signDevelopmentToken(
  authMethod: AuthProfile['authMethod'],
  userID: string,
  sessionID: string
) {
  const data = {
    [TOKEN_ID_ATTRIBUTE[authMethod]]: userID,
    aud: OIDC_TOKEN_AUD_ATTRIBUTE_VALUE[authMethod],
    sid: sessionID,
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
  userID: string,
  sessionID: string
) {
  const uat = (Date.now() / 1000) | 0;
  const iat = uat;
  const exp = iat + OIDC_SESSION_MAX_AGE_SECONDS;

  const value = await encryptCookieValue(
    JSON.stringify({
      id_token:
        TMA_LONG_LIVED_ID_TOKENS?.[userID] ??
        (await signDevelopmentToken(authMethod, userID, sessionID)),
    }),
    {
      iat,
      uat,
      exp,
    }
  );

  return value;
}

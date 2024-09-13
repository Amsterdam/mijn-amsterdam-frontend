import * as jose from 'jose';
import { DEV_JWK_PRIVATE } from '../config/development';
import {
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  TOKEN_ID_ATTRIBUTE,
} from './auth-config';
import { AuthProfile } from './auth-types';

/**
 *
 * Helpers for development
 */

export async function getPrivateKeyForDevelopment() {
  return jose.importJWK(DEV_JWK_PRIVATE);
}

export async function signDevelopmentToken(
  authMethod: AuthProfile['authMethod'],
  userID: string,
  sessionID: SessionID
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

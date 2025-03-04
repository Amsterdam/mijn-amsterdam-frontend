import { AccessToken } from 'express-openid-connect';
import * as jose from 'jose';
import memoizee from 'memoizee';

import {
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  TOKEN_ID_ATTRIBUTE,
} from './auth-config';
import { AuthProfile } from './auth-types';
import { DEV_JWK_PRIVATE } from '../config/development';
import { logger } from '../logging';

/**
 *
 * Helpers for development
 */

export async function getPrivateKeyForDevelopment() {
  return jose.importJWK(DEV_JWK_PRIVATE);
}

async function signDevelopmentToken_(
  authMethod: AuthProfile['authMethod'],
  userID: string,
  sessionID: SessionID
): Promise<AccessToken['access_token'] | undefined> {
  const data = {
    [TOKEN_ID_ATTRIBUTE[authMethod]]: userID,
    aud: OIDC_TOKEN_AUD_ATTRIBUTE_VALUE[authMethod],
    sid: sessionID,
  };
  const alg = 'RS256';
  try {
    const accessToken = await new jose.SignJWT(data)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(await getPrivateKeyForDevelopment());
    return accessToken;
  } catch (err) {
    logger.error(err);
  }
}

export const signDevelopmentToken = memoizee(signDevelopmentToken_);

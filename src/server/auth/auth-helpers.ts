import axios, { AxiosRequestConfig } from 'axios';
import type { Request, Response } from 'express';
import { AccessToken } from 'express-openid-connect';
import * as jose from 'jose';
import memoizee from 'memoizee';
import { createSecretKey, hkdfSync } from 'node:crypto';
import { ParsedQs } from 'qs';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import { IS_AP } from '../../universal/config/env';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { getFromEnv } from '../helpers/env';
import { axiosRequest } from '../helpers/source-api-request';
import { ExternalConsumerEndpoints } from '../routing/bff-routes';
import { generateFullApiUrlBFF } from '../routing/route-helpers';
import { captureException } from '../services/monitoring';
import { addToBlackList } from '../services/session-blacklist';
import {
  OIDC_COOKIE_ENCRYPTION_KEY,
  OIDC_ID_TOKEN_EXP,
  OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_TOKEN_ID_ATTRIBUTE,
  RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
  RETURNTO_MAMS_LANDING,
  TOKEN_ID_ATTRIBUTE,
  TokenIdAttribute,
} from './auth-config';
import { getPublicKeyForDevelopment } from './auth-helpers-development';
import { authRoutes } from './auth-routes';
import {
  AuthProfile,
  AuthProfileAndToken,
  SessionData,
  TokenData,
} from './auth-types';

export function getReturnToUrl(queryParams?: ParsedQs) {
  switch (queryParams?.returnTo) {
    case RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER:
      return generateFullApiUrlBFF(
        ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
        {
          token: queryParams['amsapp-session-token'] as string,
        }
      );
    default:
    case RETURNTO_MAMS_LANDING:
      return authRoutes.AUTH_LOGIN_DIGID_LANDING;
  }
}

export function getAuthProfile(
  sessionData: SessionData,
  tokenData: TokenData
): AuthProfile {
  const idAttr = OIDC_TOKEN_ID_ATTRIBUTE[sessionData.authMethod](tokenData);
  return {
    id: tokenData[idAttr],
    sid: tokenData.sid,
    authMethod: sessionData.authMethod,
    profileType: sessionData.profileType,
  };
}

function getSessionData(req: Request) {
  const reqWithSession = req as Request &
    Record<typeof OIDC_SESSION_COOKIE_NAME, SessionData>;
  return reqWithSession[OIDC_SESSION_COOKIE_NAME] ?? null;
}

export async function getAuthSessionStoreFromRequest(
  req: Request
): Promise<AuthProfileAndToken> {
  const tokenData = req.oidc.user as TokenData;
  const oidcToken = req.oidc.idToken ?? '';
  const sessionData = getSessionData(req);

  if (!sessionData) {
    throw new Error('Could not get session data.');
  }

  if (!sessionData.authMethod) {
    throw new Error('Could not determine authentication method.');
  }

  const profile = getAuthProfile(sessionData, tokenData);

  return {
    token: oidcToken,
    profile,
  };
}

export const getAuth = memoizee(getAuthSessionStoreFromRequest);

export async function getProfileType(req: Request): Promise<ProfileType> {
  const auth = await getAuth(req);
  const profileType = auth.profile.profileType;
  return profileType || DEFAULT_PROFILE_TYPE;
}

// async function getAuth_(req: Request): Promise<AuthProfileAndToken> {
//   const combinedCookies = combineCookieChunks(req.cookies);
//   const oidcToken = await getOIDCToken(combinedCookies);
//   const tokenData = await decodeOIDCToken(oidcToken);
//   const profile = getAuthProfile(tokenData);

//   return {
//     token: oidcToken,
//     profile,
//   };
// }

// export const getAuth = memoizee(getAuth_);

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
  return cookieName === OIDC_SESSION_COOKIE_NAME;
}

export function hasSessionCookie(req: Request) {
  return Object.keys(req.cookies).some((cookieName) =>
    isSessionCookieName(cookieName)
  );
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

const getJWK = memoizee(async () => {
  if (IS_AP) {
    const jwksUrl = getFromEnv('BFF_OIDC_JWKS_URL', true);

    return axiosRequest
      .request({
        url: jwksUrl,
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

export function decodeToken<T extends Record<string, string> = {}>(
  jwtToken: string
): T {
  return jose.decodeJwt(jwtToken) as unknown as T;
}

export function createLogoutHandler(
  postLogoutRedirectUrl: string,
  doIDPLogout: boolean = true
) {
  return async (req: Request, res: Response) => {
    if (req.oidc.isAuthenticated() && doIDPLogout) {
      const auth = await getAuth(req);
      // Add the session ID to a blacklist. This way the jwt id_token, which itself has longer lifetime, cannot be reused after logging out at IDP.
      if (auth.profile.sid) {
        await addToBlackList(auth.profile.sid);
      }
      return res.oidc.logout({
        returnTo: postLogoutRedirectUrl,
        logoutParams: {
          id_token_hint: !FeatureToggle.oidcLogoutHintActive
            ? auth.token
            : null,
          logout_hint: FeatureToggle.oidcLogoutHintActive
            ? auth.profile.sid
            : null,
        },
      });
    }

    // Destroy the session context
    (req as any)[OIDC_SESSION_COOKIE_NAME] = undefined;
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);

    return res.redirect(postLogoutRedirectUrl);
  };
}

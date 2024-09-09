import type { Request, Response } from 'express';
import * as jose from 'jose';
import memoizee from 'memoizee';
import { ParsedQs } from 'qs';
import { DEFAULT_PROFILE_TYPE } from '../../universal/config/app';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { ExternalConsumerEndpoints } from '../routing/bff-routes';
import { generateFullApiUrlBFF } from '../routing/route-helpers';
import { captureException } from '../services/monitoring';
import { addToBlackList } from '../services/session-blacklist';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_TOKEN_ID_ATTRIBUTE,
  RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
  RETURNTO_MAMS_LANDING,
} from './auth-config';
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
  return reqWithSession?.[OIDC_SESSION_COOKIE_NAME] ?? null;
}

export function getAuth(req: Request) {
  const tokenData = (req.oidc?.user as TokenData | null) ?? null;
  const oidcToken = req.oidc?.idToken ?? '';
  const sessionData = getSessionData(req);

  if (!sessionData?.authMethod || !tokenData) {
    return null;
  }

  const profile = getAuthProfile(sessionData, tokenData);

  return {
    token: oidcToken,
    profile,
  };
}

export function isSessionCookieName(cookieName: string) {
  return cookieName === OIDC_SESSION_COOKIE_NAME;
}

export function hasSessionCookie(req: Request) {
  return Object.keys(req.cookies).some((cookieName) =>
    isSessionCookieName(cookieName)
  );
}

export async function isRequestAuthenticated(
  req: Request,
  authMethod: AuthMethod
) {
  try {
    if (req.oidc.isAuthenticated()) {
      const auth = getAuth(req);
      if (auth) {
        return auth.profile.authMethod === authMethod;
      }
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
      const auth = getAuth(req);
      if (auth) {
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
    }

    // Destroy the session context
    (req as any)[OIDC_SESSION_COOKIE_NAME] = undefined;
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);

    return res.redirect(postLogoutRedirectUrl);
  };
}

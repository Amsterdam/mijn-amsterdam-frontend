import { millisecondsToSeconds } from 'date-fns/millisecondsToSeconds';
import type { Request, Response } from 'express';
import * as jose from 'jose';
import { ParsedQs } from 'qs';

import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_TOKEN_ID_ATTRIBUTE,
  RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
  RETURNTO_AMSAPP_STADSPAS_APP_LANDING,
  RETURNTO_MAMS_LANDING_DIGID,
  RETURNTO_MAMS_LANDING_EHERKENNING,
} from './auth-config';
import { authRoutes } from './auth-routes';
import {
  AuthenticatedRequest,
  AuthProfile,
  AuthProfileAndToken,
  MaSession,
  TokenData,
} from './auth-types';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { AppRoutes } from '../../universal/config/routes';
import { PROFILE_TYPES } from '../../universal/types/App.types';
import { ONE_SECOND_MS } from '../config/app';
import { logger } from '../logging';
import { ExternalConsumerEndpoints } from '../routing/bff-routes';
import { generateFullApiUrlBFF } from '../routing/route-helpers';
import { captureException } from '../services/monitoring';

export function getReturnToUrl(
  queryParams?: ParsedQs,
  defaultReturnTo: string = authRoutes.AUTH_LOGIN_DIGID_LANDING
) {
  switch (queryParams?.returnTo) {
    case RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER:
      return generateFullApiUrlBFF(
        ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
        {
          token: queryParams['amsapp-session-token'] as string,
        }
      );
    case RETURNTO_AMSAPP_STADSPAS_APP_LANDING: {
      return generateFullApiUrlBFF(
        ExternalConsumerEndpoints.public.STADSPAS_APP_LANDING
      );
    }
    case AppRoutes.ZAAK_STATUS:
      return getReturnToUrlZaakStatus(queryParams);
    case RETURNTO_MAMS_LANDING_EHERKENNING:
      return authRoutes.AUTH_LOGIN_EHERKENNING_LANDING;
    case RETURNTO_MAMS_LANDING_DIGID:
      return authRoutes.AUTH_LOGIN_DIGID_LANDING;
    default:
      return defaultReturnTo;
  }
}

export function getReturnToUrlZaakStatus(queryParams?: ParsedQs) {
  const searchParams =
    queryParams?.id && queryParams?.thema
      ? `?id=${queryParams.id}&thema=${queryParams.thema}`
      : '';
  const redirectUrl = `${process.env.MA_FRONTEND_URL}${AppRoutes.ZAAK_STATUS}${searchParams}`;
  return redirectUrl;
}

export function getAuthProfile(
  maSession: MaSession,
  tokenData: TokenData
): AuthProfile {
  const idAttr = OIDC_TOKEN_ID_ATTRIBUTE[maSession.authMethod](tokenData);
  const id = String(tokenData[idAttr]);
  return {
    id,
    sid: maSession.sid,
    authMethod: maSession.authMethod,
    profileType: maSession.profileType,
  };
}

function getSessionData(req: Request) {
  const reqWithSession = req as Request &
    Record<typeof OIDC_SESSION_COOKIE_NAME, MaSession>;
  return reqWithSession?.[OIDC_SESSION_COOKIE_NAME] ?? null;
}

export function getAuth(req: Request): AuthProfileAndToken | null {
  const tokenData = (req.oidc?.user as TokenData | null) ?? null;
  const accessToken = req.oidc?.accessToken?.access_token ?? '';
  const maSession = getSessionData(req);

  if (
    !maSession?.authMethod ||
    !tokenData ||
    !(maSession.authMethod in OIDC_TOKEN_ID_ATTRIBUTE)
  ) {
    return null;
  }

  const profile = getAuthProfile(maSession, tokenData);

  return {
    token: accessToken,
    profile,
    expiresAtMilliseconds: maSession.expires_at * ONE_SECOND_MS,
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
    logger.error(error);
    captureException(error);
  }
  return false;
}

export function decodeToken<T extends Record<string, string>>(
  jwtToken: string
): T {
  return jose.decodeJwt(jwtToken) as unknown as T;
}

function isIDPSessionExpired(expiresAtInSeconds: number) {
  return expiresAtInSeconds < millisecondsToSeconds(Date.now());
}

export function destroySession(req: AuthenticatedRequest, res: Response) {
  req[OIDC_SESSION_COOKIE_NAME] = undefined;
  res.clearCookie(OIDC_SESSION_COOKIE_NAME, {
    path: '/',
    secure: true,
    sameSite: 'lax',
    httpOnly: true,
  });
}

export function createLogoutHandler(
  postLogoutRedirectUrl: string,
  doIDPLogout: boolean = true
) {
  return async (req: AuthenticatedRequest, res: Response) => {
    const auth = getAuth(req);
    const returnTo = getReturnToUrl(req.query, postLogoutRedirectUrl);
    if (
      doIDPLogout &&
      auth?.expiresAtMilliseconds &&
      !isIDPSessionExpired(auth.expiresAtMilliseconds)
    ) {
      return res.oidc.logout({
        returnTo,
        logoutParams: {
          id_token_hint: !FeatureToggle.oidcLogoutHintActive
            ? auth.token
            : null,
          logout_hint: FeatureToggle.oidcLogoutHintActive
            ? req[OIDC_SESSION_COOKIE_NAME]?.TMASessionID
            : null,
        },
      });
    }

    if (hasSessionCookie(req)) {
      destroySession(req, res);
    }

    return res.redirect(returnTo);
  };
}

export function isValidProfileType(profileType: unknown) {
  return PROFILE_TYPES.includes(profileType as ProfileType);
}

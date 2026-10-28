import type { NextFunction, Request, Response } from 'express';

import { ensureOIDCAuthContext } from './route-helpers-oidc.ts';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config.ts';
import { featureToggle } from '../services/amsapp/auth/amsapp-auth-service-config.ts';

export const AMSAPP_SESSION_TOKEN_HEADER = 'x-amsapp-session-token';

function getHeaderValue(req: Request, headerName: string): string | undefined {
  return req.get(headerName)?.trim() || undefined;
}

function appendSessionCookieHeader(req: Request, sessionToken: string) {
  const cookiePair = `${OIDC_SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}`;
  const existingCookieHeader = req.headers.cookie;

  req.headers.cookie = existingCookieHeader
    ? `${existingCookieHeader}; ${cookiePair}`
    : cookiePair;
}

async function applyAmsAppSessionTokenAsCookie(req: Request) {
  const token = getHeaderValue(req, AMSAPP_SESSION_TOKEN_HEADER);
  if (!token || req.cookies?.[OIDC_SESSION_COOKIE_NAME]) {
    return;
  }

  req.cookies ??= {};
  req.cookies[OIDC_SESSION_COOKIE_NAME] = token;
  appendSessionCookieHeader(req, token);
}

export async function privateNetworkAuthContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!featureToggle.amsAppUniversalAuthIsActive) {
    return next();
  }
  try {
    await applyAmsAppSessionTokenAsCookie(req);

    const sessionTokenFromUpdatedCookie =
      req.cookies?.[OIDC_SESSION_COOKIE_NAME];
    if (!sessionTokenFromUpdatedCookie) {
      return next();
    }

    await ensureOIDCAuthContext(req, res);

    return next();
  } catch (error) {
    return next(error);
  }
}

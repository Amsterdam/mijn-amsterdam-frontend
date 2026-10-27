import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { ensureOIDCAuthContextStub } from './route-helpers-oidc.ts';
import { IS_AP } from '../../universal/config/env.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  openIdAuth,
} from '../auth/auth-config.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import { featureToggle } from '../services/amsapp/auth/amsapp-auth-service-config.ts';

export const AMSAPP_SESSION_TOKEN_HEADER = 'x-amsapp-session-token';

let oidcDigidAuthHandler: RequestHandler | null = null;

function getOidcDigidAuthHandler() {
  if (!oidcDigidAuthHandler) {
    oidcDigidAuthHandler = openIdAuth(oidcConfigDigid);
  }

  return oidcDigidAuthHandler;
}

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
  if (!featureToggle.amsAppUniversalAuthIsActive) {
    return;
  }

  const token = getHeaderValue(req, AMSAPP_SESSION_TOKEN_HEADER);
  if (!token || req.cookies?.[OIDC_SESSION_COOKIE_NAME]) {
    return;
  }

  req.cookies ??= {};
  req.cookies[OIDC_SESSION_COOKIE_NAME] = token;
  appendSessionCookieHeader(req, token);
}

async function ensureOidcAuthContext(req: Request, res: Response) {
  await new Promise<void>((resolve, reject) => {
    getOidcDigidAuthHandler()(req, res, (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
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

    if (!IS_AP) {
      await ensureOIDCAuthContextStub(req);
    }

    if (!getAuth(req)) {
      await ensureOidcAuthContext(req, res);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

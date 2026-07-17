import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { ensureDevelopmentAuthContext } from './app-router-development.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
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
  const value = req.headers[headerName];

  if (typeof value === 'string') {
    return value.trim() || undefined;
  }

  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === 'string' && entry);
    return first?.trim() || undefined;
  }

  return undefined;
}

function appendSessionCookieHeader(req: Request, sessionToken: string) {
  const cookiePair = `${OIDC_SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}`;
  const existingCookieHeader = req.headers.cookie;

  if (typeof existingCookieHeader === 'string' && existingCookieHeader) {
    req.headers.cookie = `${existingCookieHeader}; ${cookiePair}`;
    return;
  }

  if (Array.isArray(existingCookieHeader) && existingCookieHeader.length > 0) {
    const first = existingCookieHeader[0] ?? '';
    req.headers.cookie = `${first}; ${cookiePair}`;
    return;
  }

  req.headers.cookie = cookiePair;
}

function applyAmsAppSessionTokenAsCookie(req: Request) {
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
  if (!featureToggle.amsAppUniversalAuthIsActive) {
    return;
  }
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
    applyAmsAppSessionTokenAsCookie(req);

    if (!req.cookies?.[OIDC_SESSION_COOKIE_NAME]) {
      return next();
    }

    if (!IS_PRODUCTION) {
      await ensureDevelopmentAuthContext(req);
    }

    if (!getAuth(req)) {
      await ensureOidcAuthContext(req, res);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

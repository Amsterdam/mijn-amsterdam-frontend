import { createHash } from 'node:crypto';

import { HttpStatusCode } from 'axios';
import type { NextFunction, Request, Response } from 'express';
import z from 'zod';

import {
  AMSAPP_AUTH_DEEP_LINK_BASE,
  apiResponseErrors,
} from './amsapp-auth-service-config.ts';
import {
  consumeByAuthorizationCode,
  createLoginAttempt,
  getByAuthorizationCode,
  markLoginReady,
  revokeSessionToken,
} from './amsapp-auth-store.ts';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../../universal/helpers/api.ts';
import { RETURNTO_AMSAPP_AUTH_CALLBACK } from '../../../auth/auth-after-redirect-returnto.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from '../../../auth/auth-config.ts';
import { getAuth } from '../../../auth/auth-helpers.ts';
import { authRoutes } from '../../../auth/auth-routes.ts';
import { ONE_SECOND_MS } from '../../../config/app.ts';
import { AMSAPP_SESSION_TOKEN_HEADER } from '../../../routing/app-router-private-auth-context.ts';
import { handleServicesAll } from '../../../routing/app-router-protected.ts';
import {
  generateFullApiUrlBFF,
  sendResponse,
} from '../../../routing/route-helpers.ts';
import { trackEvent } from '../../monitoring.ts';
import { baseRenderProps } from '../amsapp-service-config.ts';
import type { ApiError, RenderProps } from '../amsapp-types.ts';

const loginStartQuerySchema = z.object({
  codeChallenge: z.string().min(1),
});

const tokenExchangeBodySchema = z.object({
  authorizationCode: z.string().min(1),
  codeVerifier: z.string().min(1),
});

function getCodeChallengeFromVerifier(codeVerifier: string) {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}

function isPkceMatch(codeVerifier: string, codeChallenge: string) {
  return getCodeChallengeFromVerifier(codeVerifier) === codeChallenge;
}

function getErrorRenderProps(loginId: string, error: ApiError): RenderProps {
  return {
    ...baseRenderProps,
    error,
    identifier: loginId,
    appHref: `${AMSAPP_AUTH_DEEP_LINK_BASE}/mislukt?errorMessage=${encodeURIComponent(error.message)}&errorCode=${error.code}`,
    promptOpenApp: error.code === apiResponseErrors.DIGID_AUTH.code,
    redirectToLogout: false,
  };
}

function getApiErrorMessage(error: ApiError) {
  return `ApiError ${error.code} - ${error.message}`;
}

function sendTokenExchangeError(
  res: Response,
  error: ApiError,
  details?: string
) {
  return sendResponse(
    res,
    apiErrorResult(
      details
        ? `${getApiErrorMessage(error)}: ${details}`
        : getApiErrorMessage(error),
      null,
      HttpStatusCode.BadRequest
    )
  );
}

function buildInputValidationDetails(error: z.ZodError) {
  return error.issues
    .map(
      (issue) =>
        `for property '${issue.path.join('.') || '.'}' with error '${issue.message}'`
    )
    .join(' - ');
}

function getSessionTokenFromRequest(req: Request) {
  const cookieToken = req.cookies?.[OIDC_SESSION_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  const headerValue = req.headers[AMSAPP_SESSION_TOKEN_HEADER];
  if (typeof headerValue === 'string') {
    return headerValue.trim() || null;
  }

  if (Array.isArray(headerValue)) {
    const token = headerValue.find((value) => !!value)?.trim();
    return token || null;
  }

  return null;
}

export async function handleAmsAppAuthLoginStart(req: Request, res: Response) {
  const result = loginStartQuerySchema.safeParse(req.query);
  if (!result.success) {
    return sendTokenExchangeError(
      res,
      apiResponseErrors.INVALID_INPUT,
      buildInputValidationDetails(result.error)
    );
  }

  const loginId = await createLoginAttempt(result.data.codeChallenge);

  return res.redirect(
    generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_DIGID, [
      {
        returnTo: RETURNTO_AMSAPP_AUTH_CALLBACK,
        'amsapp-login-id': loginId,
      },
    ])
  );
}

export async function handleAmsAppAuthCallback(
  req: Request<{ loginId: string }>,
  res: Response
) {
  const auth = getAuth(req);

  if (!auth || auth.profile.profileType !== 'private') {
    return res.render(
      'amsapp-open-app',
      getErrorRenderProps(req.params.loginId, apiResponseErrors.DIGID_AUTH)
    );
  }

  const maSessionCookieValue = req.cookies?.[OIDC_SESSION_COOKIE_NAME] ?? '';
  const record = await markLoginReady(req.params.loginId, maSessionCookieValue);
  if (!record?.authorizationCode) {
    return res.render(
      'amsapp-open-app',
      getErrorRenderProps(
        req.params.loginId,
        apiResponseErrors.LOGIN_NOT_FOUND_OR_EXPIRED
      )
    );
  }

  const renderProps: RenderProps = {
    ...baseRenderProps,
    identifier: record.loginId,
    appHref: `${AMSAPP_AUTH_DEEP_LINK_BASE}/gelukt?authorizationCode=${record.authorizationCode}`,
    promptOpenApp: false,
    redirectToLogout: false,
  };

  return res.render('amsapp-open-app', renderProps);
}

export async function handleAmsAppAuthTokenExchange(
  req: Request,
  res: Response
) {
  const result = tokenExchangeBodySchema.safeParse(req.body);
  if (!result.success) {
    trackEvent('amsapp-auth-exchange-failure', {
      reason: apiResponseErrors.INVALID_INPUT.code,
    });
    return sendTokenExchangeError(
      res,
      apiResponseErrors.INVALID_INPUT,
      buildInputValidationDetails(result.error)
    );
  }

  const record = await getByAuthorizationCode(result.data.authorizationCode);
  if (!record || record.status !== 'ready') {
    trackEvent('amsapp-auth-exchange-failure', {
      reason: apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED.code,
    });
    return sendTokenExchangeError(
      res,
      apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED
    );
  }

  if (!isPkceMatch(result.data.codeVerifier, record.codeChallenge)) {
    trackEvent('amsapp-auth-exchange-failure', {
      reason: apiResponseErrors.PKCE_MISMATCH.code,
    });
    return sendTokenExchangeError(res, apiResponseErrors.PKCE_MISMATCH);
  }

  const consumedRecord = await consumeByAuthorizationCode(
    result.data.authorizationCode
  );
  if (!consumedRecord?.maSessionCookieValue) {
    trackEvent('amsapp-auth-exchange-failure', {
      reason: apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED.code,
    });
    return sendTokenExchangeError(
      res,
      apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED
    );
  }

  return res.send(
    apiSuccessResult({
      session: {
        name: OIDC_SESSION_COOKIE_NAME,
        value: consumedRecord.maSessionCookieValue,
        expiresAt: Date.now() + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS,
      },
    })
  );
}

export async function handleAmsAppAuthLogout(req: Request, res: Response) {
  const sessionToken = getSessionTokenFromRequest(req);

  if (!sessionToken) {
    trackEvent('amsapp-auth-logout-failure', {
      reason: apiResponseErrors.INVALID_INPUT.code,
    });
    return sendTokenExchangeError(res, apiResponseErrors.INVALID_INPUT);
  }

  await revokeSessionToken(sessionToken);

  res.clearCookie(OIDC_SESSION_COOKIE_NAME, {
    path: '/',
    secure: true,
    sameSite: 'lax',
    httpOnly: true,
  });

  return res.send(
    apiSuccessResult({
      session: {
        name: OIDC_SESSION_COOKIE_NAME,
        invalidated: true,
      },
    })
  );
}

export async function handleAmsAppAuthServicesAllProxy(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return handleServicesAll(req, res, next);
}

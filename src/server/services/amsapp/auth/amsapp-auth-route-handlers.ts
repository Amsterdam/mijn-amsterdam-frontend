import { createHash, timingSafeEqual } from 'node:crypto';

import type { Request, Response } from 'express';
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
} from './amsapp-auth-store.ts';
import { apiSuccessResult } from '../../../../universal/helpers/api.ts';
import { RETURNTO_AMSAPP_AUTH_CALLBACK } from '../../../auth/auth-after-redirect-returnto.ts';
import { OIDC_SESSION_COOKIE_NAME } from '../../../auth/auth-config.ts';
import { getAuth } from '../../../auth/auth-helpers.ts';
import { authRoutes } from '../../../auth/auth-routes.ts';
import {
  generateFullApiUrlBFF,
  sendBadRequest,
  sendBadRequestInvalidInput,
} from '../../../routing/route-helpers.ts';
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
  const expectedCodeChallenge = Buffer.from(
    getCodeChallengeFromVerifier(codeVerifier)
  );
  const givenCodeChallenge = Buffer.from(codeChallenge);

  if (expectedCodeChallenge.length !== givenCodeChallenge.length) {
    return false;
  }

  return timingSafeEqual(expectedCodeChallenge, givenCodeChallenge);
}

function getErrorRenderProps(loginId: string, error: ApiError): RenderProps {
  return {
    ...baseRenderProps,
    error,
    identifier: loginId,
    appHref: `${AMSAPP_AUTH_DEEP_LINK_BASE}/mislukt?errorMessage=${encodeURIComponent(error.message)}&errorCode=${error.code}`,
    promptOpenApp: error.code === apiResponseErrors.DIGID_AUTH.code,
  };
}

export async function handleAmsAppAuthLoginStart(req: Request, res: Response) {
  const result = loginStartQuerySchema.safeParse(req.query);
  if (!result.success) {
    return sendBadRequestInvalidInput(res, result.error);
  }

  const loginId = createLoginAttempt(result.data.codeChallenge);

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
  const record = markLoginReady(req.params.loginId, maSessionCookieValue);
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
  };

  return res.render('amsapp-open-app', renderProps);
}

export async function handleAmsAppAuthTokenExchange(
  req: Request,
  res: Response
) {
  const result = tokenExchangeBodySchema.safeParse(req.body);
  if (!result.success) {
    return sendBadRequestInvalidInput(res, result.error);
  }

  const record = getByAuthorizationCode(result.data.authorizationCode);
  if (!record || record.status !== 'ready') {
    return sendBadRequest(res, 'Unknown or invalid authorizationCode');
  }

  if (!isPkceMatch(result.data.codeVerifier, record.codeChallenge)) {
    return sendBadRequest(res, 'Invalid codeVerifier for authorizationCode');
  }

  const consumedRecord = consumeByAuthorizationCode(
    result.data.authorizationCode
  );
  if (!consumedRecord?.maSessionCookieValue) {
    return sendBadRequest(res, 'Unknown or invalid authorizationCode');
  }

  return res.send(
    apiSuccessResult({
      session: {
        name: OIDC_SESSION_COOKIE_NAME,
        value: consumedRecord.maSessionCookieValue,
      },
    })
  );
}

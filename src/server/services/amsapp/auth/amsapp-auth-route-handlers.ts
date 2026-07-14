import type { Request, Response } from 'express';
import z from 'zod';

import {
  AMSAPP_AUTH_DEEP_LINK_BASE,
  apiResponseErrors,
} from './amsapp-auth-service-config.ts';
import {
  createLoginAttempt,
  getByAuthorizationCode,
  markLoginReady,
} from './amsapp-auth-store.ts';
import { apiSuccessResult } from '../../../../universal/helpers/api.ts';
import { RETURNTO_AMSAPP_AUTH_CALLBACK } from '../../../auth/auth-after-redirect-returnto.ts';
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
  code_challenge: z.string().min(1),
});

const tokenExchangeBodySchema = z.object({
  authorization_code: z.string().min(1),
});

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

  const loginId = createLoginAttempt(result.data.code_challenge);

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

  const record = markLoginReady(req.params.loginId);
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
    appHref: `${AMSAPP_AUTH_DEEP_LINK_BASE}/gelukt?authorization_code=${record.authorizationCode}`,
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

  const record = getByAuthorizationCode(result.data.authorization_code);
  if (!record || record.status !== 'ready') {
    return sendBadRequest(res, 'Unknown or invalid authorization_code');
  }

  return res.send(
    apiSuccessResult({
      login_id: record.loginId,
      status: record.status,
    })
  );
}

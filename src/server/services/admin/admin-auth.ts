import * as msal from '@azure/msal-node'; // MSAL App Configuration
import type { Request, Response } from 'express';

import {
  MSAL_AUTH_SCOPES,
  OAUTH_ROLE_APPLICATION_ADMIN,
  REDIRECT_URI,
} from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { sendResponseHTML } from '../../routing/route-helpers.ts';
import { captureException } from '../monitoring.ts';
import { getAdminRedirectUrl } from './admin-helpers.ts';

const cryptoProvider = new msal.CryptoProvider();
const msalApp = new msal.ConfidentialClientApplication({
  auth: {
    clientId: getFromEnv('BFF_ADMIN_AUTH_CLIENT_ID') ?? '', // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: `https://login.microsoftonline.com/${getFromEnv('BFF_ADMIN_AUTH_TENANT_ID') ?? ''}`, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: getFromEnv('BFF_ADMIN_AUTH_CLIENT_SECRET'), // Client secret generated from the app registration in Azure portal
  },
});

export async function handleLogin(req: Request, res: Response) {
  try {
    const url = (req.query.originalUrl as string) ?? '';
    const redirectUrl = await msalApp.getAuthCodeUrl({
      responseMode: 'form_post',
      redirectUri: REDIRECT_URI,
      scopes: MSAL_AUTH_SCOPES,
      // Encode the original URL the user was trying to access so we can redirect them back to it after logging in.
      state: cryptoProvider.base64Encode(
        JSON.stringify({
          originalUrl: getAdminRedirectUrl(url),
        })
      ),
    });

    res.redirect(redirectUrl);
  } catch (error) {
    captureException(error);
    sendResponseHTML(
      res,
      apiErrorResult('Error generating authentication URL', null, 500)
    );
  }
}

export async function handleCallback(req: Request, res: Response) {
  let authResponse: msal.AuthenticationResult | null = null;
  try {
    authResponse = await msalApp.acquireTokenByCode(
      {
        code: req.body.code,
        scopes: MSAL_AUTH_SCOPES,
        redirectUri: REDIRECT_URI,
      },
      req.body
    );
    if (!authResponse) {
      throw new Error('Could not acquire token by code');
    }
  } catch (error) {
    captureException(error);
    return sendResponseHTML(
      res,
      apiErrorResult(
        `Error handling authentication callback${!IS_PRODUCTION ? `: ${error}` : ''}`,
        null,
        500
      )
    );
  }

  const req_ = req as RequestWithSession;

  const idTokenRoles: string[] =
    authResponse.account?.idTokenClaims?.roles ?? [];

  if (!idTokenRoles.includes(OAUTH_ROLE_APPLICATION_ADMIN)) {
    return sendResponseHTML(
      res,
      apiErrorResult('User access denied: missing required role', null, 403)
    );
  }
  if (!req_.session) {
    return sendResponseHTML(
      res,
      apiErrorResult('User access denied: session is not available', null, 500)
    );
  }

  const session = req_.session;
  session.isAuthenticated = true;
  session.username = authResponse.account?.username ?? 'no-name';

  // Check if we need to redirect back to the original url the user was trying to access.
  const originalUrl =
    JSON.parse(Buffer.from(req.body.state, 'base64').toString('utf-8'))
      .originalUrl ?? '';
  const redirectToUrl = getAdminRedirectUrl(originalUrl);
  res.redirect(redirectToUrl);
}

export async function handleLogout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.redirect(getFromEnv('BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI') ?? '/');
  });
}

export const forTesting = {
  msalApp,
};

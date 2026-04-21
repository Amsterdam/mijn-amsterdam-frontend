import * as msal from '@azure/msal-node';
import type { Request, Response } from 'express';

import { getAdminRedirectUrl } from './admin-helpers.ts';
import {
  BFF_ADMIN_AUTH_CLIENT_ID,
  BFF_ADMIN_AUTH_CLIENT_SECRET,
  BFF_ADMIN_AUTH_TENANT_ID,
  MSAL_AUTH_SCOPES,
  OAUTH_ROLE_APPLICATION_ADMIN,
  BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI,
  BFF_ADMIN_AUTH_REDIRECT_URI,
} from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';
import { sendResponseHTML } from '../../routing/route-helpers.ts';
import { captureException } from '../monitoring.ts';

const cryptoProvider = new msal.CryptoProvider();
const msalApp = new msal.ConfidentialClientApplication({
  auth: {
    clientId: BFF_ADMIN_AUTH_CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: `https://login.microsoftonline.com/${BFF_ADMIN_AUTH_TENANT_ID}`, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: BFF_ADMIN_AUTH_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
  },
});

export async function handleLogin(req: Request, res: Response) {
  try {
    const url = (req.query.originalUrl as string) ?? '';
    const redirectUrl = await msalApp.getAuthCodeUrl({
      responseMode: 'form_post',
      redirectUri: BFF_ADMIN_AUTH_REDIRECT_URI,
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
        redirectUri: BFF_ADMIN_AUTH_REDIRECT_URI,
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
  let originalUrl = '/';
  try {
    originalUrl = JSON.parse(
      Buffer.from(req.body.state, 'base64').toString('utf-8')
    ).originalUrl;
  } catch (error) {
    captureException(error, {
      properties: {
        message: 'Error parsing state from authentication callback',
        state: req.body.state,
      },
    });
  }

  const redirectToUrl = getAdminRedirectUrl(originalUrl);
  res.redirect(redirectToUrl);
}

export async function handleLogout(req: Request, res: Response) {
  function redirect() {
    return res.redirect(BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI ?? '/');
  }
  if (!req.session) {
    return redirect();
  }
  req.session.destroy(() => {
    return redirect();
  });
}

export const forTesting = {
  msalApp,
};

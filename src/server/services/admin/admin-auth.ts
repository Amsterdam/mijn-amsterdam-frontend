import * as msal from '@azure/msal-node'; // MSAL App Configuration
import type { Request, Response } from 'express';

import { REDIRECT_URI } from './admin-service-config.ts';
import { getFromEnv } from '../../helpers/env.ts';

const cryptoProvider = new msal.CryptoProvider();
const msalApp = new msal.ConfidentialClientApplication({
  auth: {
    clientId: getFromEnv('BFF_ADMIN_AUTH_CLIENT_ID') ?? '', // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: `https://login.microsoftonline.com/${getFromEnv('BFF_ADMIN_AUTH_TENANT_ID') ?? ''}`, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: getFromEnv('BFF_ADMIN_AUTH_CLIENT_SECRET'), // Client secret generated from the app registration in Azure portal
  },
});

export async function handleLogin(req: Request, res: Response) {
  const redirectUrl = await msalApp.getAuthCodeUrl({
    responseMode: 'form_post',
    redirectUri: REDIRECT_URI,
    scopes: ['user.read'],
    // Encode the original URL the user was trying to access so we can redirect them back to it after logging in.
    state: cryptoProvider.base64Encode(
      JSON.stringify({ originalUrl: req.query.originalUrl })
    ),
  });

  res.redirect(redirectUrl);
}

export async function handleRedirect(req: Request, res: Response) {
  const authResponse = await msalApp.acquireTokenByCode(
    {
      code: req.body.code,
      scopes: ['user.read'],
      redirectUri: REDIRECT_URI,
    },
    req.body
  );
  const session = req.session as any; // Type assertion to avoid TypeScript errors - in a real implementation, you would want to properly type your session object
  session.isAuthenticated = true;
  session.account = authResponse.account;
  session.idToken = authResponse.idToken;
  session.user = authResponse.account?.username ?? 'no-name';

  // Check if we need to redirect back to the original url the user was trying to access.
  const successRedirectUrl = JSON.parse(atob(req.body.state)).originalUrl;
  res.redirect(successRedirectUrl || '/');
}

export async function handleLogout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session during logout:', err);
    }
    res.redirect(getFromEnv('BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI') ?? '/');
  });
}

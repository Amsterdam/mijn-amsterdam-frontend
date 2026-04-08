import * as msal from '@azure/msal-node'; // MSAL App Configuration
import type { Request, Response } from 'express';

import { REDIRECT_URI } from './admin-service-config.ts';
import { BFF_API_ADMIN_BASE_URL } from '../../config/app.ts';
import { getFromEnv } from '../../helpers/env.ts';

const cryptoProvider = new msal.CryptoProvider();
const msalApp = new msal.ConfidentialClientApplication({
  auth: {
    clientId: getFromEnv('BFF_ADMIN_AUTH_CLIENT_ID') ?? '', // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: `https://login.microsoftonline.com/${getFromEnv('BFF_ADMIN_AUTH_TENANT_ID') ?? ''}`, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: getFromEnv('BFF_ADMIN_AUTH_CLIENT_SECRET'), // Client secret generated from the app registration in Azure portal
  },
});

const MSAL_AUTH_SCOPES = ['User.read'];

export async function handleLogin(req: Request, res: Response) {
  try {
    const redirectUrl = await msalApp.getAuthCodeUrl({
      responseMode: 'form_post',
      redirectUri: REDIRECT_URI,
      scopes: MSAL_AUTH_SCOPES,
      // Encode the original URL the user was trying to access so we can redirect them back to it after logging in.
      state: cryptoProvider.base64Encode(
        JSON.stringify({
          originalUrl: req.query.originalUrl || BFF_API_ADMIN_BASE_URL,
        })
      ),
    });

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error generating auth code URL:', error);
    res.status(500).send('Error generating authentication URL');
  }
}

export async function handleCallback(req: Request, res: Response) {
  console.log('Received auth code callback with query:', req.query, req.body);
  try {
    const authResponse = await msalApp.acquireTokenByCode(
      {
        code: req.body.code,
        scopes: MSAL_AUTH_SCOPES,
        redirectUri: REDIRECT_URI,
      },
      req.body
    );
    console.log('authResponse', authResponse);
    const session = req.session as any; // Type assertion to avoid TypeScript errors - in a real implementation, you would want to properly type your session object
    session.isAuthenticated = true;
    session.account = authResponse.account;
    session.idToken = authResponse.idToken;
    session.user = authResponse.account?.username ?? 'no-name';

    // Check if we need to redirect back to the original url the user was trying to access.
    const successRedirectUrl = JSON.parse(atob(req.body.state)).originalUrl;
    res.redirect(successRedirectUrl || '/');
  } catch (error) {
    console.error('Error handling auth code callback:', error);
    res.status(500).send('Error handling authentication callback');
  }
}

export async function handleLogout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session during logout:', err);
    }
    res.redirect(getFromEnv('BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI') ?? '/');
  });
}

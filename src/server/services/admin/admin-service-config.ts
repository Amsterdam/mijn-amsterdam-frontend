import type { Configuration } from '@azure/msal-node';

import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { getFromEnv } from '../../helpers/env.ts';

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
export const MA_ADMIN_MSAL_CONFIG: Configuration = {
  auth: {
    clientId: getFromEnv('BFF_ADMIN_AUTH_CLIENT_ID') ?? '', // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: `https://login.microsoftonline.com/${getFromEnv('BFF_ADMIN_AUTH_TENANT_ID') ?? ''}`, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
    clientSecret: getFromEnv('BFF_ADMIN_AUTH_CLIENT_SECRET'), // Client secret generated from the app registration in Azure portal
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3,
    },
  },
};

export const REDIRECT_URI = getFromEnv('BFF_ADMIN_AUTH_REDIRECT_URI') ?? '';
export const POST_LOGOUT_REDIRECT_URI = getFromEnv(
  'BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI'
);
export const GRAPH_ME_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

export const MSAL2 = {
  authOptions: {
    clientId: MA_ADMIN_MSAL_CONFIG.auth.clientId,
    authority: MA_ADMIN_MSAL_CONFIG.auth.authority,
  },
  request: {
    authCodeUrlParameters: {
      scopes: ['user.read'],
      redirectUri: REDIRECT_URI ?? '',
    },
    tokenRequest: {
      redirectUri: REDIRECT_URI ?? '',
      scopes: ['user.read'],
    },
  },
  resourceApi: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
  },
};

export const IS_ADMIN_ROUTER_ENABLED = isEnabled('MA_ADMIN.router');

export const routes = {
  public: {
    INDEX: '/',
    auth: {
      SIGNIN: '/auth/signin',
      SIGNOUT: '/auth/signout',
      ACQUIRE_TOKEN: '/auth/acquireToken',
      CALLBACK: '/auth/callback',
    },
  },
  protected: {
    visitors: {
      STATS: '/visitors{/:authMethod}',
      STATS_TABLE: '/visitors/table',
    },
    CACHE_OVERVIEW: '/cache',
  },
};

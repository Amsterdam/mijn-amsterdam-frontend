import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const REDIRECT_URI = getFromEnv('BFF_ADMIN_AUTH_REDIRECT_URI') ?? '';
export const POST_LOGOUT_REDIRECT_URI = getFromEnv(
  'BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI'
);
export const GRAPH_ME_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
export const MSAL_AUTH_SCOPES = ['User.read'];
export const OAUTH_ROLE_APPLICATION_ADMIN = 'ApplicationAdmin';

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

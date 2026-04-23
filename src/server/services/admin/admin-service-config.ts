import { isEnabled } from '../../config/azure-appconfiguration.ts';
import { getFromEnv } from '../../helpers/env.ts';

function getAdminAuthEnv(key: string): string {
  return (
    getFromEnv(
      `BFF_ADMIN_AUTH_${key}`,
      IS_ADMIN_ROUTER_ENABLED,
      IS_ADMIN_ROUTER_ENABLED
    ) ?? ''
  );
}

export const IS_ADMIN_ROUTER_ENABLED = isEnabled('MA_ADMIN.router');
export const GRAPH_ME_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
export const MSAL_AUTH_SCOPES = ['User.read'];
export const OAUTH_ROLE_APPLICATION_ADMIN = 'ApplicationAdmin';

export const BFF_ADMIN_AUTH_REDIRECT_URI = getAdminAuthEnv('REDIRECT_URI');
export const BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI = getAdminAuthEnv(
  'POST_LOGOUT_REDIRECT_URI'
);
export const BFF_ADMIN_AUTH_CLIENT_ID = getAdminAuthEnv('CLIENT_ID');
export const BFF_ADMIN_AUTH_TENANT_ID = getAdminAuthEnv('TENANT_ID');
export const BFF_ADMIN_AUTH_CLIENT_SECRET = getAdminAuthEnv('CLIENT_SECRET');
export const BFF_ADMIN_AUTH_EXPRESS_SESSION_SECRET = getAdminAuthEnv(
  'EXPRESS_SESSION_SECRET'
);
export const BFF_ADMIN_AUTH_SESSION_COOKIE_NAME = '__MA-adminSession';
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

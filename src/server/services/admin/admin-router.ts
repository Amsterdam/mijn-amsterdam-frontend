import express from 'express';

import {
  getAccountDataHandler,
  updateAccountDataHandler,
} from './admin-account.route-handlers.ts';
import { handleLogin, handleLogout, handleCallback } from './admin-auth.ts';
import {
  adminIndexHandler,
  authCheckHandler,
  cacheOverviewHandler,
} from './admin-route-handlers.ts';
import {
  IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED,
  routes,
} from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { loginStats, loginStatsTable } from './admin-visitors.ts';
import { IS_AP, OTAP_ENV } from '../../../universal/config/env.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

// Public routes that don't require authentication.
// Don't use this router for routes that should be protected, as these routes are mounted before the authentication middleware in app-router-admin.ts
const maAdminAuthRouterPublic = createBFFRouter({
  id: 'ma-admin-router-public',
});

if (!IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED) {
  if (IS_AP) {
    throw new Error(
      `Admin authentication middleware is disabled, but the app is running in ${OTAP_ENV} mode. This is not allowed.`
    );
  }
  maAdminAuthRouterPublic.use((req, _res, next) => {
    console.info(
      'Admin authentication middleware is disabled. All admin routes will be accessible without authentication.'
    );

    (req as RequestWithSession).session.isAuthenticated = true;
    (req as RequestWithSession).session.username =
      `${getFromEnv('MA_DEV_ADMIN_USERNAME') ?? '--no-username--'}`;

    next();
  });
}

maAdminAuthRouterPublic.get(routes.public.auth.SIGNIN, handleLogin);
maAdminAuthRouterPublic.use(express.urlencoded({ extended: true }));
maAdminAuthRouterPublic.post(routes.public.auth.CALLBACK, handleCallback);
maAdminAuthRouterPublic.get(routes.public.auth.SIGNOUT, handleLogout);
maAdminAuthRouterPublic.get(routes.public.INDEX, adminIndexHandler);
maAdminAuthRouterPublic.get(routes.public.auth.CHECK, authCheckHandler);

// Use this router for generic admin routes that should be protected by authentication.
// This router is mounted after the authentication middleware in router-admin.ts, so all routes defined here will require authentication.
const maAdminRouterProtected = createBFFRouter({
  id: 'ma-admin-router-protected',
});

maAdminRouterProtected.get(
  routes.protected.visitors.STATS_TABLE,
  loginStatsTable
);
maAdminRouterProtected.get(routes.protected.visitors.STATS, loginStats);

maAdminRouterProtected.get(routes.protected.ACCOUNT, getAccountDataHandler);
maAdminRouterProtected.put(
  routes.protected.ACCOUNT,
  express.json(),
  updateAccountDataHandler
);

maAdminRouterProtected.get(
  routes.protected.CACHE_OVERVIEW,
  cacheOverviewHandler
);

export const router = {
  public: maAdminAuthRouterPublic,
  protected: maAdminRouterProtected,
};

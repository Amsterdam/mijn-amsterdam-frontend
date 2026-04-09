import { handleLogin, handleLogout, handleRedirect } from './admin-auth.ts';
import {
  adminIndexHandler,
  cacheOverviewHandler,
} from './admin-route-handlers.ts';
import { routes } from './admin-service-config.ts';
import { loginStats, loginStatsTable } from './admin-visitors.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

// Public routes that don't require authentication.
// Don't use this router for routes that should be protected, as these routes are mounted before the authentication middleware in router-admin.ts
const maAdminAuthRouterPublic = createBFFRouter({
  id: 'ma-admin-auth-router',
});

maAdminAuthRouterPublic.get(routes.public.INDEX, adminIndexHandler);
maAdminAuthRouterPublic.get(routes.public.auth.SIGNIN, handleLogin);
maAdminAuthRouterPublic.post(routes.public.auth.REDIRECT, handleRedirect);
maAdminAuthRouterPublic.get(routes.public.auth.SIGNOUT, handleLogout);

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

maAdminRouterProtected.get(
  routes.protected.CACHE_OVERVIEW,
  cacheOverviewHandler
);

export const router = {
  public: maAdminAuthRouterPublic,
  protected: maAdminRouterProtected,
};

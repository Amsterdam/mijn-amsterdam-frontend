import session from 'express-session';

import { createBFFRouter } from './route-helpers.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import {
  BFF_ADMIN_AUTH_SESSION_COOKIE_NAME,
  IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED,
} from '../services/admin/admin-service-config.ts';
import {
  BFF_ADMIN_AUTH_EXPRESS_SESSION_SECRET,
  IS_ADMIN_ROUTER_ENABLED,
} from '../services/admin/admin-service-config.ts';

type CreateAdminRouterOptions = {
  isAdminRouterEnabled: boolean;
  isAdminAuthenticationMiddlewareEnabled: boolean;
  isProduction: boolean;
  bffAdminAuthExpressSessionSecret: string;
  bffAdminAuthSessionCookieName: string;
};

export async function createAdminRouter({
  isAdminRouterEnabled,
  isAdminAuthenticationMiddlewareEnabled,
  isProduction,
  bffAdminAuthExpressSessionSecret,
  bffAdminAuthSessionCookieName,
}: CreateAdminRouterOptions) {
  const router = createBFFRouter({
    id: 'router-admin',
    isEnabled: isAdminRouterEnabled,
  });

  if (!isAdminRouterEnabled) {
    return router;
  }

  const { isAuthenticatedAdmin } =
    await import('../services/admin/admin-route-handlers.ts');
  const { router: adminRouter } =
    await import('../services/admin/admin-router.ts');
  const { userFeedbackRouter } =
    await import('../services/user-feedback/user-feedback.router.ts');
  const { amsappNotificationsRouter } =
    await import('../services/amsapp/notifications/amsapp-notifications-router.ts');

  router.use(
    session({
      secret: bffAdminAuthExpressSessionSecret,
      resave: false,
      saveUninitialized: false,
      name: bffAdminAuthSessionCookieName,
      cookie: {
        httpOnly: true,
        secure: isProduction,
      },
    }),
    adminRouter.public,
    // The authentication middleware is only applied to the protected admin routes,
    // so the public routes defined in router-admin.ts can be accessed without authentication (e.g. for the login flow).
    isAdminAuthenticationMiddlewareEnabled
      ? isAuthenticatedAdmin
      : (_req, _res, next) => {
          if (isProduction) {
            throw new Error(
              'Admin authentication middleware MUST be enabled in production.'
            );
          }
          next();
        },
    adminRouter.protected,
    userFeedbackRouter.admin,
    amsappNotificationsRouter.admin
  );

  return router;
}

export const router = await createAdminRouter({
  isAdminRouterEnabled: IS_ADMIN_ROUTER_ENABLED,
  isAdminAuthenticationMiddlewareEnabled:
    IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED,
  isProduction: IS_PRODUCTION,
  bffAdminAuthExpressSessionSecret: BFF_ADMIN_AUTH_EXPRESS_SESSION_SECRET,
  bffAdminAuthSessionCookieName: BFF_ADMIN_AUTH_SESSION_COOKIE_NAME,
});

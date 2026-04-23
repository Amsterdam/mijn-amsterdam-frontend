import session from 'express-session';

import { createBFFRouter } from './route-helpers.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { logger } from '../logging.ts';
import {
  BFF_ADMIN_AUTH_SESSION_COOKIE_NAME,
  IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED,
} from '../services/admin/admin-service-config.ts';
import {
  BFF_ADMIN_AUTH_EXPRESS_SESSION_SECRET,
  IS_ADMIN_ROUTER_ENABLED,
} from '../services/admin/admin-service-config.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { userFeedbackRouter } from '../services/user-feedback/user-feedback.router.ts';

export const router = createBFFRouter({
  id: 'router-admin',
  isEnabled: IS_ADMIN_ROUTER_ENABLED,
});

if (IS_ADMIN_ROUTER_ENABLED) {
  const { isAuthenticatedAdmin } =
    await import('../services/admin/admin-route-handlers.ts');
  const { router: adminRouter } =
    await import('../services/admin/admin-router.ts');
  router.use(
    session({
      secret: BFF_ADMIN_AUTH_EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: BFF_ADMIN_AUTH_SESSION_COOKIE_NAME,
      cookie: {
        httpOnly: true,
        secure: IS_PRODUCTION,
      },
    }),
    adminRouter.public,
    // The authentication middleware is only applied to the protected admin routes,
    // so the public routes defined in router-admin.ts can be accessed without authentication (e.g. for the login flow).
    IS_ADMIN_AUTHENTICATION_MIDDLEWARE_ENABLED
      ? isAuthenticatedAdmin
      : (_req, _res, next) => {
          logger.warn(
            'Admin authentication is disabled. This should only be used in development environments.'
          );
          next();
        },
    adminRouter.protected,
    userFeedbackRouter.admin,
    amsappNotificationsRouter.admin
  );
}

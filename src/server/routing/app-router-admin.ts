import session from 'express-session';

import { createBFFRouter } from './route-helpers.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { getFromEnv } from '../helpers/env.ts';
import { isAuthenticatedAdmin } from '../services/admin/admin-route-handlers.ts';
import { router as adminRouter } from '../services/admin/admin-router.ts';
import { IS_ADMIN_ROUTER_ENABLED } from '../services/admin/admin-service-config.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { userFeedbackRouter } from '../services/user-feedback/user-feedback.router.ts';

export const router = createBFFRouter({
  id: 'router-admin',
  isEnabled: IS_ADMIN_ROUTER_ENABLED,
});

router.use(
  ...(IS_ADMIN_ROUTER_ENABLED
    ? [
        session({
          secret: getFromEnv('BFF_ADMIN_AUTH_EXPRESS_SESSION_SECRET') ?? '',
          resave: false,
          saveUninitialized: false,
          cookie: {
            httpOnly: true,
            secure: IS_PRODUCTION,
          },
        }),
        adminRouter.public,
        // The authentication middleware is only applied to the protected admin routes,
        // so the public routes defined in router-admin.ts can be accessed without authentication (e.g. for the login flow).
        isAuthenticatedAdmin,
        adminRouter.protected,
        userFeedbackRouter.admin,
        amsappNotificationsRouter.admin,
      ]
    : [])
);

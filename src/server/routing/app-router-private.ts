import { privateNetworkAuthContextMiddleware } from './app-router-private-auth-context.ts';
import { createBFFRouter } from './route-helpers.ts';
import { afisRouter } from '../services/afis/afis-router.ts';
import { AMSAPP_BASE_PATH } from '../services/amsapp/amsapp-constants.ts';
import { amsappAuthRouter } from '../services/amsapp/auth/amsapp-auth-router.ts';
import { featureToggle } from '../services/amsapp/auth/amsapp-auth-service-config.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router.ts';
import { jzdRouter } from '../services/jzd/jzd-router.ts';

export const router = createBFFRouter({ id: 'router-private-network' });

if (featureToggle.amsAppUniversalAuthIsActive) {
  // Allow any route under the AMSAPP_BASE_PATH to have the private network auth context middleware applied, so that the amsapp routers can use the auth context for their routes.
  router.use(AMSAPP_BASE_PATH, privateNetworkAuthContextMiddleware);
}

router.use(
  amsappAuthRouter.private,
  amsappNotificationsRouter.private,
  amsappStadspasRouter.private,
  jzdRouter.private,
  afisRouter.private
);

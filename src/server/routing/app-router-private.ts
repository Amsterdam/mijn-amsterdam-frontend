import { createBFFRouter } from './route-helpers.ts';
import { afisRouter } from '../services/afis/afis-router.ts';
import { amsappAuthRouter } from '../services/amsapp/auth/amsapp-auth-router.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router.ts';
import { jzdRouter } from '../services/jzd/jzd-router.ts';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  amsappAuthRouter.private,
  amsappNotificationsRouter.private,
  amsappStadspasRouter.private,
  jzdRouter.private,
  afisRouter.private
);

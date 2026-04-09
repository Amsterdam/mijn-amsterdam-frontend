import { createBFFRouter } from './route-helpers.ts';
import { afisRouter } from '../services/afis/afis-router.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router.ts';
import { wmoRouter } from '../services/wmo/wmo-router.ts';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  amsappNotificationsRouter.private,
  amsappStadspasRouter.private,
  wmoRouter.private,
  afisRouter.private
);

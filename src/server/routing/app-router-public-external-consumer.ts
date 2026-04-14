import { createBFFRouter } from './route-helpers.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router.ts';

export const router = createBFFRouter({
  id: 'router-public-external-consumer',
});

router.use(amsappNotificationsRouter.public, amsappStadspasRouter.public);

import { createBFFRouter } from './route-helpers';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router';

export const router = createBFFRouter({
  id: 'router-public-external-consumer',
});

router.use(amsappNotificationsRouter.public, amsappStadspasRouter.public);

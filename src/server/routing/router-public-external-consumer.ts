import { createBFFRouter } from './route-helpers';
import { notificationsExternalConsumerRouter } from '../services/amsapp/notifications/amsapp-notifications-router';
import { stadspasRouterExternalConsumer } from '../services/amsapp/stadspas/amsapp-stadspas-router';

export const router = createBFFRouter({
  id: 'router-public-external-consumer',
});

router.use(
  notificationsExternalConsumerRouter.public,
  stadspasRouterExternalConsumer.public
);

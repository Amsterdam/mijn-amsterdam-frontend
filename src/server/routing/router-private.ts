import { createBFFRouter } from './route-helpers';
import { afisRouter } from '../services/afis/afis-router';
import { notificationsExternalConsumerRouter } from '../services/amsapp/notifications/amsapp-notifications-router';
import { stadspasRouterExternalConsumer } from '../services/amsapp/stadspas/amsapp-stadspas-router';
import { wmoRouter } from '../services/wmo/wmo-router';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  notificationsExternalConsumerRouter.private,
  stadspasRouterExternalConsumer.private,
  wmoRouter.private,
  afisRouter.private
);

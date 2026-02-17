import { createBFFRouter } from './route-helpers';
import { notificationsExternalConsumerRouter } from '../services/notifications/notifications-router';
import { afisRouter } from '../services/afis/afis-router';
import { stadspasExternalConsumerRouter } from '../services/hli/router-stadspas-external-consumer';
import { wmoRouter } from '../services/wmo/wmo-router';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  notificationsExternalConsumerRouter.private,
  stadspasExternalConsumerRouter.private,
  wmoRouter.private,
  afisRouter.private
);

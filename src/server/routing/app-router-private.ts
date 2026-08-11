import { createBFFRouter } from './route-helpers.ts';
import { afisRouter } from '../services/afis/afis-router.ts';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router.ts';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router.ts';
import { zorgnedAanvragenApiRouter } from '../services/zorgned-aanvragen-api/zorgned-aanvragen-api-router.ts';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  amsappNotificationsRouter.private,
  amsappStadspasRouter.private,
  zorgnedAanvragenApiRouter.private,
  afisRouter.private
);

import { createBFFRouter } from './route-helpers';
import { appConfigurationRouter } from '../config/azure-appconfiguration';
import { afisRouter } from '../services/afis/afis-router';
import { amsappNotificationsRouter } from '../services/amsapp/notifications/amsapp-notifications-router';
import { amsappStadspasRouter } from '../services/amsapp/stadspas/amsapp-stadspas-router';
import { wmoRouter } from '../services/wmo/wmo-router';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  amsappNotificationsRouter.private,
  amsappStadspasRouter.private,
  wmoRouter.private,
  afisRouter.private,
  appConfigurationRouter.private
);

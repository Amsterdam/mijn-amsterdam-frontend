import { isEnabled } from '../config/azure-appconfiguration.ts';
import { afisRouter } from '../services/afis/afis-router.ts';
import { jzdRouter } from '../services/jzd/jzd-router.ts';
import { createBFFRouter } from './route-helpers.ts';

export const router = createBFFRouter({
  id: 'router-external-consumer',
  isEnabled: isEnabled('ENABLEU.apiRoutes'),
});

router.use(jzdRouter.external, afisRouter.external);

import { createBFFRouter } from './route-helpers';
import { notificationsExternalConsumerRouter } from './router-notifications-external-consumer';
import { stadspasExternalConsumerRouter } from './router-stadspas-external-consumer';
import { afisTempRouter } from '../services/afis/afis-temp-router';
import { wmoRouter } from '../services/wmo/wmo-router';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(notificationsExternalConsumerRouter.private);
router.use(wmoRouter.private);
router.use(stadspasExternalConsumerRouter.private);
router.use(afisTempRouter.private);

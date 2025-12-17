import { OAuthVerificationHandler } from './route-handlers';
import { createBFFRouter } from './route-helpers';
import { notificationsExternalConsumerRouter } from './router-notifications-external-consumer';
import { IS_TAP } from '../../universal/config/env';
import { afisRouter } from '../services/afis/afis-router';
import { stadspasExternalConsumerRouter } from '../services/hli/router-stadspas-external-consumer';
import { wmoRouter } from '../services/wmo/wmo-router';
import { OAUTH_ROLES } from '../auth/auth-config';
import { conditional } from '../helpers/middleware';

export const router = createBFFRouter({ id: 'router-private-network' });

router.use(
  notificationsExternalConsumerRouter.private,
  stadspasExternalConsumerRouter.private
);

router.use(
  conditional(
    IS_TAP,
    OAuthVerificationHandler(OAUTH_ROLES['wmo.voorzieningen'])
  ),
  wmoRouter.private
);
router.use(
  conditional(
    IS_TAP,
    OAuthVerificationHandler(
      OAUTH_ROLES['afis.e-mandates.sign-request-status-notify']
    )
  ),
  afisRouter.private
);

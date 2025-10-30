import type { Request } from 'express';

import { fetchBrpByBsn } from './brp';
import { featureToggle, routes } from './brp-service-config';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  createBFFRouter,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';

const protectedRouter = createBFFRouter({
  id: 'protected-brp',
  isEnabled: featureToggle.router.protected.isEnabled,
});

if (!IS_PRODUCTION) {
  protectedRouter.get(
    routes.protected.BRP_PERSONEN_RAW,
    async (_req: Request, res: ResponseAuthenticated) => {
      const RAW_DATA = true;
      return res.send(
        await fetchBrpByBsn(
          res.locals.sessionId,
          [res.locals.authProfileAndToken.profile.id],
          RAW_DATA
        )
      );
    }
  );
}

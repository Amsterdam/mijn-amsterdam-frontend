import type { Request } from 'express';

import { featureToggle, routes } from './brp-service-config.ts';
import { fetchBrpByBsn } from './brp.ts';
import { fetchAantalIngeschrevenPersonen } from './brp.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import {
  createBFFRouter,
  sendResponse,
  type RequestWithQueryParams,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param.ts';

export const routerProtected = createBFFRouter({
  id: 'protected-brp',
  isEnabled: featureToggle.router.protected.isEnabled,
});

routerProtected.get(
  routes.protected.BRP_AANTAL_INGESCHREVEN_PERSONEN_OP_ADRES,
  async (
    req: RequestWithQueryParams<{ id: string }>,
    res: ResponseAuthenticated
  ) => {
    const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
      req.query.id,
      res.locals.authProfileAndToken
    );

    if (decryptResult.status === 'ERROR') {
      return sendResponse(res, decryptResult);
    }

    const bagID = decryptResult.content;

    const response = await fetchAantalIngeschrevenPersonen(
      res.locals.authProfileAndToken.profile.sid,
      bagID
    );

    return sendResponse(res, response);
  }
);

if (!IS_PRODUCTION) {
  routerProtected.get(
    routes.protected.BRP_PERSONEN_RAW,
    async (_req: Request, res: ResponseAuthenticated) => {
      return res.send(
        await fetchBrpByBsn(res.locals.sessionId, [
          res.locals.authProfileAndToken.profile.id,
        ])
      );
    }
  );
  routerProtected.get(
    routes.protected.BRP_VERBLIJFPLAATSHISTORIE_RAW,
    async (_req: Request, res: ResponseAuthenticated) => {
      return res.send(
        await fetchBrpByBsn(res.locals.sessionId, [
          res.locals.authProfileAndToken.profile.id,
        ])
      );
    }
  );
}

export const brpRouter = {
  protected: routerProtected,
};

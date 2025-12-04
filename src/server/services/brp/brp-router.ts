import type { Request } from 'express';

import { fetchBrpByBsn } from './brp';
import { fetchAantalBewoners } from './brp';
import { featureToggle, routes } from './brp-service-config';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  createBFFRouter,
  sendResponse,
  type RequestWithQueryParams,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export const routerProtected = createBFFRouter({
  id: 'protected-brp',
  isEnabled: featureToggle.router.protected.isEnabled,
});

routerProtected.get(
  routes.protected.BRP_AANTAL_BEWONERS_OP_ADRES,
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

    const response = await fetchAantalBewoners(
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

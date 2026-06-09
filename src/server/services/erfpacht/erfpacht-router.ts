import type { Request } from 'express';

import { featureToggle, routes } from './erfpacht-service-config.ts';
import { fetchErfpachtDossiersDetail } from './erfpacht.ts';
import {
  createBFFRouter,
  type ResponseAuthenticated,
  sendResponse,
} from '../../routing/route-helpers.ts';

const erfpachtRouterProtected = createBFFRouter({
  id: 'erfpacht-router-protected',
  isEnabled: featureToggle.service.enabled,
});

erfpachtRouterProtected.get(
  routes.protected.ERFPACHT_DOSSIER_DETAILS,
  async (req: Request<{ dossierId: string }>, res: ResponseAuthenticated) => {
    const response = await fetchErfpachtDossiersDetail(
      res.locals.authProfileAndToken,
      req.params.dossierId
    );

    return sendResponse(res, response);
  }
);

export const erfpachtRouter = {
  protected: erfpachtRouterProtected,
};

import type { Request } from 'express';

import { featureToggle, routes } from './erfpacht-service-config.ts';
import type { ErfpachtDossiersDetailSource } from './erfpacht-types.ts';
import type { ZaakInfoSource } from './erfpacht-zaken-types.ts';
import {
  fetchErfpachtDossiersDetail,
  fetchZaakDetailWithStatussen,
} from './erfpacht.ts';
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
  async (
    req: Request<{ dossierId: ErfpachtDossiersDetailSource['dossierId'] }>,
    res: ResponseAuthenticated
  ) => {
    const response = await fetchErfpachtDossiersDetail(
      res.locals.authProfileAndToken,
      req.params.dossierId
    );

    return sendResponse(res, response);
  }
);

erfpachtRouterProtected.get(
  routes.protected.ERFPACHT_ZAAK_DETAILS,
  async (
    req: Request<{
      zaakUrl: ZaakInfoSource['zaakUrl'];
      uuid: ZaakInfoSource['zaakUuid'];
    }>,
    res: ResponseAuthenticated
  ) => {
    const response = await fetchZaakDetailWithStatussen(
      res.locals.authProfileAndToken,
      req.params.uuid,
      req.params.zaakUrl
    );
    return sendResponse(res, response);
  }
);

export const erfpachtRouter = {
  protected: erfpachtRouterProtected,
};

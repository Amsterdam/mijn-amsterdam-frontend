import type { Request } from 'express';

import { fetchErfpachtDossiersDetail } from './erfpacht-dossiers.ts';
import { featureToggle, routes } from './erfpacht-service-config.ts';
import type { ErfpachtDossiersDetailSource } from './erfpacht-types.ts';
import type { ErfpachtZaakExcerptFrontend } from './erfpacht-zaken-types.ts';
import { fetchErfpachtZaakDetail } from './erfpacht-zaken.ts';
import {
  createBFFRouter,
  type ResponseAuthenticated,
  sendResponse,
} from '../../routing/route-helpers.ts';

const erfpachtRouterProtected = createBFFRouter({
  id: 'erfpacht-router-protected',
  isEnabled: featureToggle.serviceEnabled,
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
      zaakUrl: ErfpachtZaakExcerptFrontend['zaakUrl'];
      uuid: ErfpachtZaakExcerptFrontend['zaakUuid'];
    }>,
    res: ResponseAuthenticated
  ) => {
    const response = await fetchErfpachtZaakDetail(
      res.locals.authProfileAndToken,
      req.params.uuid
    );
    return sendResponse(res, response);
  }
);

export const erfpachtRouter = {
  protected: erfpachtRouterProtected,
};

import express from 'express';

import {
  handleCreateVerificationRequest,
  handleFetchDienstverlener,
  handleVerifyVerificationRequest,
  handleSetContactgegeven,
  handleFetchCommunicatievoorkeuren,
} from './klantcontact-route-handlers.ts';
import { routes } from './klantcontact-service-config.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

const routerProtected = createBFFRouter({ id: 'contact-router-protected' });

routerProtected.use(routes.BASE, express.urlencoded({ extended: true }));

routerProtected.post(
  routes.VERIFICATION_REQUEST_CREATE,
  handleCreateVerificationRequest
);

routerProtected.post(
  routes.VERIFICATION_REQUEST_VERIFY,
  handleVerifyVerificationRequest
);

routerProtected.get(
  routes.CONTACT_GET_COMMUNICATIEVOORKEUREN,
  handleFetchCommunicatievoorkeuren
);
routerProtected.post(
  routes.CONTACT_SET_CONTACTGEGEVEN,
  handleSetContactgegeven
);

routerProtected.get(
  routes.CONTACT_GET_DIENSTVERLENER,
  handleFetchDienstverlener
);

export const klantcontactRouter = {
  protected: routerProtected,
};

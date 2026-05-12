import express from 'express';

import {
  handleCreateVerificationRequest,
  handleGetDienstverlener,
  handleVerifyVerificationRequest,
  handleSetContactgegeven,
  handleGetCommunicatievoorkeuren,
} from './contact-route-handlers.ts';
import { routes } from './contact-service-config.ts';
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
  handleGetCommunicatievoorkeuren
);
routerProtected.post(
  routes.CONTACT_SET_CONTACTGEGEVEN,
  handleSetContactgegeven
);

routerProtected.get(routes.CONTACT_GET_DIENSTVERLENER, handleGetDienstverlener);

export const contactRouter = {
  protected: routerProtected,
};

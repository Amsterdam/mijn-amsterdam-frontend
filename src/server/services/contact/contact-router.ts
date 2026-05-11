import { createBFFRouter } from '../../routing/route-helpers.ts';
import { handleCreateVerificationRequest, handleVerifyVerificationRequest } from './contact-route-handlers.ts';
import { routes } from './contact-service-config.ts';

const routerProtected = createBFFRouter({ id: 'contact-router-protected' });

routerProtected.post(
  routes.VERIFICATION_REQUEST_CREATE,
  handleCreateVerificationRequest
);

routerProtected.post(
  routes.VERIFICATION_REQUEST_VERIFY,
  handleVerifyVerificationRequest
);

export const contactRouter = {
  protected: routerProtected
}

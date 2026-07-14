import {
  handleAmsAppAuthCallback,
  handleAmsAppAuthLoginStart,
  handleAmsAppAuthServicesAllProxy,
  handleAmsAppAuthTokenExchange,
} from './amsapp-auth-route-handlers.ts';
import { routes } from './amsapp-auth-service-config.ts';
import { apiKeyVerificationHandler } from '../../../routing/route-handlers.ts';
import { createBFFRouter } from '../../../routing/route-helpers.ts';

const routerPublic = createBFFRouter({
  id: 'external-consumer-public-amsapp-auth',
});

routerPublic.get(routes.public.AMSAPP_AUTH_LOGIN, handleAmsAppAuthLoginStart);
routerPublic.get(routes.public.AMSAPP_AUTH_CALLBACK, handleAmsAppAuthCallback);

const routerPrivate = createBFFRouter({
  id: 'external-consumer-private-amsapp-auth',
});

routerPrivate.post(
  routes.private.AMSAPP_AUTH_TOKEN,
  apiKeyVerificationHandler,
  handleAmsAppAuthTokenExchange
);

routerPrivate.get(
  routes.private.AMSAPP_AUTH_SERVICES_ALL,
  apiKeyVerificationHandler,
  handleAmsAppAuthServicesAllProxy
);

export const amsappAuthRouter = {
  public: routerPublic,
  private: routerPrivate,
};

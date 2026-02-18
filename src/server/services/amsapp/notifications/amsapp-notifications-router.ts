import { Request, Response } from 'express';

import {
  handleRegisterConsumer,
  handleConsumerRegistrationStatus,
  handleUnregisterConsumer,
  handleTruncateNotifications,
  fetchAndStoreNotifications,
  handleSendNotificationsResponse,
} from './amsapp-notifications-route-handlers';
import { featureToggle, routes } from './amsapp-notifications-service-config';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { RETURNTO_NOTIFICATIES_CONSUMER_ID } from '../../../auth/auth-after-redirect-returnto';
import { authRoutes } from '../../../auth/auth-routes';
import { apiKeyVerificationHandler } from '../../../routing/route-handlers';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
} from '../../../routing/route-helpers';

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerPublic = createBFFRouter({
  id: 'external-consumer-public-notifications',
  isEnabled: featureToggle.amsNotificationsIsActive,
});

routerPublic.get(
  routes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_LOGIN,
  async (req: Request<{ consumerId: string }>, res: Response) => {
    return res.redirect(
      generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_DIGID, [
        {
          returnTo: RETURNTO_NOTIFICATIES_CONSUMER_ID,
          consumerId: req.params.consumerId,
        },
      ])
    );
  }
);

routerPublic.get(
  routes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_ACTION,
  handleRegisterConsumer
);

routerPublic.get(
  routes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_STATUS,
  handleConsumerRegistrationStatus
);

routerPublic.delete(
  routes.public.NOTIFICATIONS_CONSUMER_REGISTRATION_STATUS,
  handleUnregisterConsumer
);

// PRIVATE NETWORK ROUTER
// ======================
export const routerPrivate = createBFFRouter({
  id: 'external-consumer-private-notifications',
  isEnabled: featureToggle.amsNotificationsIsActive,
});

// This route will never be enabled in production
if (!IS_PRODUCTION) {
  routerPrivate.delete(
    routes.private.NOTIFICATIONS,
    apiKeyVerificationHandler,
    handleTruncateNotifications
  );
}

routerPrivate.post(
  routes.private.NOTIFICATIONS_JOB,
  apiKeyVerificationHandler,
  fetchAndStoreNotifications
);

routerPrivate.get(
  routes.private.NOTIFICATIONS,
  apiKeyVerificationHandler,
  handleSendNotificationsResponse
);

export const notificationsExternalConsumerRouter = {
  public: routerPublic,
  private: routerPrivate,
};

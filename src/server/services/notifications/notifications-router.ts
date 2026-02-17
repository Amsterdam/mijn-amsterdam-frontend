import { Request, Response } from 'express';

import {
  sendAppLandingResponse,
  sendConsumerIdResponse,
  sendConsumerIdStatusResponse,
  sendUnregisterConsumerResponse,
  truncateNotifications,
  fetchAndStoreNotifications,
  sendNotificationsResponse,
} from './notifications-route-handlers';
import { featureToggle, routes } from './notifications-service-config';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { RETURNTO_NOTIFICATIES_CONSUMER_ID } from '../../auth/auth-config';
import { authRoutes } from '../../auth/auth-routes';
import { apiKeyVerificationHandler } from '../../routing/route-handlers';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
} from '../../routing/route-helpers';

const AMSAPP_PROTOCOl = 'amsterdam://';
export const AMSAPP_NOTIFICATIONS_DEEP_LINK = `${AMSAPP_PROTOCOl}mijn-amsterdam`;

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerPublic = createBFFRouter({
  id: 'external-consumer-public-notifications',
  isEnabled: featureToggle.amsNotificationsIsActive,
});

routerPublic.get(
  routes.public.NOTIFICATIONS_LOGIN,
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

routerPublic.get(routes.public.NOTIFICATIONS_APP, sendAppLandingResponse);

routerPublic.get(
  routes.public.NOTIFICATIONS_CONSUMER_APP,
  sendConsumerIdResponse
);

routerPublic.get(
  routes.public.NOTIFICATIONS_CONSUMER,
  sendConsumerIdStatusResponse
);

routerPublic.delete(
  routes.public.NOTIFICATIONS_CONSUMER,
  sendUnregisterConsumerResponse
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
    truncateNotifications
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
  sendNotificationsResponse
);

export const notificationsExternalConsumerRouter = {
  public: routerPublic,
  private: routerPrivate,
};

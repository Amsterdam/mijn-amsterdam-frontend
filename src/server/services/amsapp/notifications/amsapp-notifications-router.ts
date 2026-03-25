import type { Request, Response } from 'express';

import { getRegistrationOverview } from './amsapp-notifications-model.ts';
import {
  handleRegisterConsumer,
  handleConsumerRegistrationProfile,
  handleUnregisterConsumer,
  handleTruncateNotifications,
  fetchAndStoreNotifications,
  handleSendNotificationsResponse,
} from './amsapp-notifications-route-handlers.ts';
import { featureToggle, routes } from './amsapp-notifications-service-config.ts';
import { IS_PRODUCTION } from '../../../../universal/config/env.ts';
import { apiErrorResult } from '../../../../universal/helpers/api.ts';
import { RETURNTO_NOTIFICATIES_CONSUMER_ID } from '../../../auth/auth-after-redirect-returnto.ts';
import { authRoutes } from '../../../auth/auth-routes.ts';
import { apiKeyVerificationHandler } from '../../../routing/route-handlers.ts';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
  sendResponse,
} from '../../../routing/route-helpers.ts';
import { captureException } from '../../monitoring.ts';

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
const routerPublic = createBFFRouter({
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

// PRIVATE NETWORK ROUTER
// ======================
const routerPrivate = createBFFRouter({
  id: 'external-consumer-private-notifications',
  isEnabled: featureToggle.amsNotificationsIsActive,
});

routerPrivate.get(
  routes.private.NOTIFICATIONS_CONSUMER_REGISTRATION_PROFILE,
  apiKeyVerificationHandler,
  handleConsumerRegistrationProfile
);

routerPrivate.delete(
  routes.private.NOTIFICATIONS_CONSUMER_REGISTRATION_PROFILE,
  apiKeyVerificationHandler,
  handleUnregisterConsumer
);

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

const routerAdmin = createBFFRouter({
  id: 'external-consumer-admin-notifications',
  isEnabled: featureToggle.amsNotificationsIsActive,
});

routerPublic.get(
  routes.admin.NOTIFICATIONS_CONSUMER_REGISTRATION_OVERVIEW,
  async (_req: Request, res: Response) => {
    let overview;
    try {
      overview = await getRegistrationOverview();
    } catch (error) {
      captureException(error);
      return sendResponse(
        res,
        apiErrorResult('Failed to get registration overview', null, 500)
      );
    }
    return res.send(overview);
  }
);

export const amsappNotificationsRouter = {
  public: routerPublic,
  private: routerPrivate,
  admin: routerAdmin,
};

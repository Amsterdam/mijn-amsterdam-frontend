import { Request, Response } from 'express';

import { ExternalConsumerEndpoints } from './bff-routes';
import { apiKeyVerificationHandler } from './route-handlers';
import { createBFFRouter, sendBadRequest } from './route-helpers';
import { apiSuccessResult } from '../../universal/helpers/api';
import { RETURNTO_NOTIFICATIES_CONSUMER_ID } from '../auth/auth-config';
import { getAuth } from '../auth/auth-helpers';
import { authRoutes } from '../auth/auth-routes';
import { AuthProfileAndToken } from '../auth/auth-types';
import { logger } from '../logging';
import {
  batchFetchAndStoreNotifications,
  batchFetchNotifications,
  registerConsumer,
} from '../services/notifications/notifications';

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerPublic = createBFFRouter({
  id: 'external-consumer-public-notifications',
});

routerPublic.get(
  ExternalConsumerEndpoints.public.NOTIFICATIONS_LOGIN,
  async (req: Request<{ consumer_id: string }>, res: Response) => {
    return res.redirect(
      authRoutes.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_NOTIFICATIES_CONSUMER_ID}&consumer-id=${req.params.consumer_id}`
    );
  }
);

routerPublic.get(
  ExternalConsumerEndpoints.public.NOTIFICATIONS_CONSUMER_ID,
  sendConsumerIdResponse
);

// PRIVATE NETWORK ROUTER
// ======================
export const routerPrivate = createBFFRouter({
  id: 'external-consumer-private-notifications',
});

routerPrivate.get(
  ExternalConsumerEndpoints.private.NOTIFICATIONS_CRON,
  apiKeyVerificationHandler,
  fetchAndStoreNotifications
);

routerPrivate.get(
  ExternalConsumerEndpoints.private.NOTIFICATIONS,
  apiKeyVerificationHandler,
  fetchNotificationsResponse
);

type ApiError = {
  code: string;
  message: string;
};
const apiResponseErrors: Record<string, ApiError> = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  CONSUMER_ID_ERROR: {
    code: '002',
    message: 'Parameter consumer_id ontbreekt',
  },
} as const;

async function sendConsumerIdResponse(
  req: Request<{ consumer_id: string }>,
  res: Response
) {
  const authProfileAndToken: AuthProfileAndToken | null = getAuth(req);
  if (!authProfileAndToken) {
    const apiResponseError = apiResponseErrors.DIGID_AUTH;
    return sendBadRequest(
      res,
      `ApiError ${apiResponseError.code} - ${apiResponseError.message}`,
      null
    );
  }

  if (!req.params.consumer_id) {
    const apiResponseError = apiResponseErrors.CONSUMER_ID_ERROR;
    return sendBadRequest(
      res,
      `ApiError ${apiResponseError.code} - ${apiResponseError.message}`,
      null
    );
  }
  const result = await registerConsumer(
    authProfileAndToken?.profile.id,
    req.params.consumer_id,
    ['belasting']
  );
  logger.info(result);
  res.render('amsapp-stadspas-administratienummer', {}); // TODO: What should we show the user?
}

// This endpoint has a long execution time, making it impractical to await.
// A success response is send to indicate it has started.
function fetchAndStoreNotifications(req: Request, res: Response) {
  batchFetchAndStoreNotifications();
  res.send(apiSuccessResult(null));
}

async function fetchNotificationsResponse(req: Request, res: Response) {
  const response = await batchFetchNotifications();
  res.send(apiSuccessResult(response));
}

export const notificationsExternalConsumerRouter = {
  public: routerPublic,
  private: routerPrivate,
};

export const forTesting = {
  sendConsumerIdResponse,
};

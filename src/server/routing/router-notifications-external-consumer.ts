import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';

import { ExternalConsumerEndpoints } from './bff-routes';
import { apiKeyVerificationHandler } from './route-handlers';
import { createBFFRouter, generateFullApiUrlBFF } from './route-helpers';
import { IS_PRODUCTION } from '../../universal/config/env';
import { apiErrorResult, apiSuccessResult } from '../../universal/helpers/api';
import { RETURNTO_NOTIFICATIES_CONSUMER_ID } from '../auth/auth-config';
import { getAuth } from '../auth/auth-helpers';
import { authRoutes } from '../auth/auth-routes';
import { AuthProfileAndToken } from '../auth/auth-types';
import { getFromEnv } from '../helpers/env';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';
import { captureMessage } from '../services/monitoring';
import {
  batchDeleteNotifications,
  batchFetchAndStoreNotifications,
  batchFetchNotifications,
  getConsumerStatus,
  registerConsumer,
  unregisterConsumer,
} from '../services/notifications/notifications';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_NOTIFICATIONS_DEEP_LINK = `${AMSAPP_PROTOCOl}notifications`;

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerPublic = createBFFRouter({
  id: 'external-consumer-public-notifications',
});

routerPublic.get(
  ExternalConsumerEndpoints.public.NOTIFICATIONS_LOGIN,
  async (req: Request<{ consumerId: string }>, res: Response) => {
    return res.redirect(
      authRoutes.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_NOTIFICATIES_CONSUMER_ID}&consumerId=${req.params.consumerId}`
    );
  }
);

routerPublic.get(
  ExternalConsumerEndpoints.public.NOTIFICATIONS_CONSUMER_APP,
  sendConsumerIdResponse
);

routerPublic.get(
  ExternalConsumerEndpoints.public.NOTIFICATIONS_CONSUMER,
  sendConsumerIdStatusResponse
);

routerPublic.delete(
  ExternalConsumerEndpoints.public.NOTIFICATIONS_CONSUMER,
  sendUnregisterConsumerResponse
);

// PRIVATE NETWORK ROUTER
// ======================
export const routerPrivate = createBFFRouter({
  id: 'external-consumer-private-notifications',
});

// This route will never be enabled in production
if (!IS_PRODUCTION) {
  routerPrivate.delete(
    ExternalConsumerEndpoints.private.NOTIFICATIONS,
    apiKeyVerificationHandler,
    truncateNotifications
  );
}

routerPrivate.post(
  ExternalConsumerEndpoints.private.NOTIFICATIONS_JOB,
  apiKeyVerificationHandler,
  fetchAndStoreNotifications
);

routerPrivate.get(
  ExternalConsumerEndpoints.private.NOTIFICATIONS,
  apiKeyVerificationHandler,
  sendNotificationsResponse
);

type ApiError = {
  code: string;
  message: string;
};
const apiResponseErrors: Record<string, ApiError> = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  AMSAPP_DELIVERY_FAILED: {
    code: '002',
    message: 'Verzenden van consumerId naar de Amsterdam app niet gelukt',
  },
  UNKNOWN: {
    code: '000',
    message: 'Onbekende fout',
  },
} as const;

type RenderProps = {
  nonce: string;
  promptOpenApp: boolean;
  urlToImage: string;
  urlToCSS: string;
  error?: ApiError;
  identifier?: string; // Only included in debug build.
  appHref?: `${typeof AMSAPP_NOTIFICATIONS_DEEP_LINK}/${'gelukt' | 'mislukt'}${string}`;
};

const maFrontendUrl = getFromEnv('MA_FRONTEND_URL')!;
const nonce = getFromEnv('BFF_AMSAPP_NONCE')!;
const logoutUrl = `${generateFullApiUrlBFF(
  authRoutes.AUTH_LOGOUT_DIGID,
  {},
  getFromEnv('BFF_OIDC_BASE_URL')
)}?returnTo=${AMSAPP_NOTIFICATIONS_DEEP_LINK}`;

const baseRenderProps = {
  nonce,
  urlToImage: `${maFrontendUrl}/img/logo-amsterdam.svg`,
  urlToCSS: `${maFrontendUrl}/css/amsapp-landing.css`,
  logoutUrl,
};

const getRenderPropsForApiError = (
  identifier: string,
  apiResponseError: ApiError
): RenderProps => ({
  ...baseRenderProps,
  error: apiResponseError,
  appHref: `${AMSAPP_NOTIFICATIONS_DEEP_LINK}/mislukt?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
  identifier: !IS_PRODUCTION ? identifier : '',
  // No need to redirect to logout as DIGID_AUTH 001 error code means user is not logged in with Digid.
  promptOpenApp: apiResponseError.code === apiResponseErrors.DIGID_AUTH.code,
});

async function sendUnregisterConsumerResponse(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const isUnregistered = await unregisterConsumer(req.params.consumerId);
  if (isUnregistered) {
    return res.send(apiSuccessResult('Consumer deleted'));
  }
  return res.send(apiErrorResult('Not Found', null, HttpStatusCode.NotFound));
}

async function sendConsumerIdStatusResponse(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const status = await getConsumerStatus(req.params.consumerId);
  if (!status.isRegistered) {
    return res.send(apiErrorResult('Not Found', null, HttpStatusCode.NotFound));
  }
  return res.send(apiSuccessResult(status));
}

async function sendConsumerIdResponse(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const authProfileAndToken: AuthProfileAndToken | null = getAuth(req);
  if (!authProfileAndToken) {
    const apiResponseError = apiResponseErrors.DIGID_AUTH;
    captureMessage(
      `AMSAPP Notificaties sendConsumerIdResponse: ${apiResponseError.message}`
    );
    return res.render(
      'amsapp-open-app',
      getRenderPropsForApiError(req.params.consumerId, apiResponseError)
    );
  }

  try {
    await registerConsumer(
      authProfileAndToken?.profile.id,
      req.params.consumerId,
      ['belasting']
    );
  } catch (error) {
    const apiResponseError = apiResponseErrors.UNKNOWN;
    captureMessage(
      `AMSAPP Notificaties sendConsumerIdResponse: ${apiResponseError.message} ${error}`
    );
    return res.render(
      'amsapp-open-app',
      getRenderPropsForApiError(req.params.consumerId, apiResponseError)
    );
  }

  const requestConfig = getApiConfig('AMSAPP', {
    data: {
      consumerId: req.params.consumerId,
    },
  });
  const deliveryResponse = await requestData<{ detail: 'Success' }>(
    requestConfig
  );

  if (
    deliveryResponse.status === 'ERROR' ||
    deliveryResponse.content?.detail !== 'Success'
  ) {
    const apiResponseError = apiResponseErrors.AMSAPP_DELIVERY_FAILED;
    captureMessage(
      `AMSAPP Notificaties sendConsumerIdResponse: ${apiResponseError.message}`
    );
    return res.render(
      'amsapp-open-app',
      getRenderPropsForApiError(req.params.consumerId, apiResponseError)
    );
  }

  const renderProps = {
    ...baseRenderProps,
    appHref: `${AMSAPP_NOTIFICATIONS_DEEP_LINK}/gelukt`,
    promptOpenApp: true,
    identifier: !IS_PRODUCTION ? req.params.consumerId : '',
  };
  return res.render('amsapp-open-app', renderProps);
}

// This endpoint has a long execution time, making it impractical to await.
// A success response is send to indicate it has started.
function fetchAndStoreNotifications(req: Request, res: Response) {
  batchFetchAndStoreNotifications();
  return res.send(apiSuccessResult('success'));
}

async function truncateNotifications(req: Request, res: Response) {
  try {
    await batchDeleteNotifications();
  } catch (error) {
    const apiResponseError = apiResponseErrors.UNKNOWN;
    captureMessage(
      `AMSAPP Notificaties truncateNotifications: ${apiResponseError.message} ${error}`
    );
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        apiErrorResult(
          apiResponseError.message,
          null,
          HttpStatusCode.InternalServerError
        )
      );
  }

  return res.send(apiSuccessResult('success'));
}

async function sendNotificationsResponse(req: Request, res: Response) {
  const response = await batchFetchNotifications();
  return res.send(apiSuccessResult(response));
}

export const notificationsExternalConsumerRouter = {
  public: routerPublic,
  private: routerPrivate,
};

export const forTesting = {
  sendConsumerIdResponse,
  fetchAndStoreNotifications,
  sendNotificationsResponse,
};

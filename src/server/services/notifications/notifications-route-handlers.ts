import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';

import {
  unregisterConsumer,
  getConsumerStatus,
  registerConsumer,
  batchFetchAndStoreNotifications,
  batchDeleteNotifications,
  batchFetchNotifications,
} from './notifications';
import { AMSAPP_NOTIFICATIONS_DEEP_LINK } from './notifications-router';
import {
  maFrontendUrl,
  apiResponseErrors,
  nonce,
  logoutUrl,
} from './notifications-service-config';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { getAuth } from '../../auth/auth-helpers';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';
import type { ApiError, RenderProps } from './notifications-types';

const baseRenderProps = {
  nonce,
  urlToImage: `${maFrontendUrl}/img/logo-amsterdam.svg`,
  urlToCSS: `${maFrontendUrl}/css/amsapp-landing.css`,
  logoutUrl,
};

function getRenderPropsForApiError(
  identifier: string,
  apiResponseError: ApiError
): RenderProps {
  return {
    ...baseRenderProps,
    error: apiResponseError,
    appHref: `${AMSAPP_NOTIFICATIONS_DEEP_LINK}/mislukt?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
    identifier: !IS_PRODUCTION ? identifier : '',
    // If the Digid login failed we don't want the user to be redirected to logout. In this case we can open the app directly.
    // If the error is not related to the Digid login, the user must always be redirected to logout. See the amsapp-open-app.pug for logic on how we handle the redirection to logout vs opening the app directly.
    promptOpenApp: apiResponseError.code === apiResponseErrors.DIGID_AUTH.code,
  };
}

export async function sendUnregisterConsumerResponse(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const isUnregistered = await unregisterConsumer(req.params.consumerId);
  if (isUnregistered) {
    return res.send(apiSuccessResult('Consumer deleted'));
  }
  return res.send(apiErrorResult('Not Found', null, HttpStatusCode.NotFound));
}

export async function sendConsumerIdStatusResponse(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const status = await getConsumerStatus(req.params.consumerId);
  if (!status.isRegistered) {
    return res.send(apiErrorResult('Not Found', null, HttpStatusCode.NotFound));
  }
  return res.send(apiSuccessResult(status));
}

export function sendAppLandingResponse(_req: Request, res: Response) {
  const renderProps: RenderProps = {
    ...baseRenderProps,
    promptOpenApp: true,
  };
  return res.render('amsapp-open-app', renderProps);
}

export async function sendConsumerIdResponse(
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
      authProfileAndToken.profile.id,
      req.params.consumerId,
      [
        'adoptTrashContainer',
        'afis',
        'avg',
        'belasting',
        'bezwaren',
        'bodem',
        'brp',
        'fetchKrefia',
        'fetchSVWI',
        'fetchWior',
        'fetchWpi',
        'horeca',
        'klachten',
        'maintenance',
        'milieuzone',
        'overtredingen',
        'parkeren',
        'subsidie',
        'toeristischeVerhuur',
        'vergunningen',
      ]
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
    const apiResponseError =
      apiResponseErrors.AMSAPP_CONSUMER_ID_DELIVERY_FAILED;
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
export function fetchAndStoreNotifications(req: Request, res: Response) {
  batchFetchAndStoreNotifications();
  return res.send(apiSuccessResult('success'));
}

export async function truncateNotifications(req: Request, res: Response) {
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

export async function sendNotificationsResponse(req: Request, res: Response) {
  const response = await batchFetchNotifications();
  return res.send(apiSuccessResult(response));
}

export const forTesting = {
  sendConsumerIdResponse,
  fetchAndStoreNotifications,
  sendNotificationsResponse,
};

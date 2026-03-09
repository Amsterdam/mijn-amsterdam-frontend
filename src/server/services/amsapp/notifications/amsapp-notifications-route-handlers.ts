import { HttpStatusCode } from 'axios';
import type { Request, Response } from 'express';
import z from 'zod';

import {
  unregisterConsumer,
  getConsumerProfile,
  registerConsumer,
  batchFetchAndStoreNotifications,
  batchDeleteNotifications,
  batchFetchNotifications,
} from './amsapp-notifications';
import { getSevenDaysAgoISOString } from './amsapp-notifications-helper';
import {
  AMSAPP_NOTIFICATIONS_DEEP_LINK_BASE,
  apiResponseErrors,
} from './amsapp-notifications-service-config';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../../universal/helpers/api';
import { getAuth } from '../../../auth/auth-helpers';
import type { AuthProfileAndToken } from '../../../auth/auth-types';
import { fetchBrpByBsn } from '../../brp/brp';
import { captureMessage } from '../../monitoring';
import { baseRenderProps } from '../amsapp-service-config';
import type { ApiError, RenderProps } from '../amsapp-types';
import { getProfilesCount } from './amsapp-notifications-model';
import {
  sendBadRequestInvalidInput,
  sendResponse,
  type RequestWithQueryParams,
} from '../../../routing/route-helpers';

function getRenderPropsForApiError(
  identifier: string,
  apiResponseError: ApiError
): RenderProps {
  return {
    ...baseRenderProps,
    error: apiResponseError,
    appHref: `${AMSAPP_NOTIFICATIONS_DEEP_LINK_BASE}/mislukt?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
    identifier: !IS_PRODUCTION ? identifier : '',
    // If the Digid login failed we don't want the user to be redirected to logout. In this case we can open the app directly.
    // If the error is not related to the Digid login, the user must always be redirected to logout. See the amsapp-open-app.pug for logic on how we handle the redirection to logout vs opening the app directly.
    promptOpenApp: apiResponseError.code === apiResponseErrors.DIGID_AUTH.code,
  };
}

export async function handleUnregisterConsumer(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const isUnregistered = await unregisterConsumer(req.params.consumerId);
  if (isUnregistered) {
    return res.send(apiSuccessResult('Consumer deleted'));
  }
  return res.send(apiErrorResult('Not Found', null, HttpStatusCode.NotFound));
}

export async function handleConsumerRegistrationProfile(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const profile = await getConsumerProfile(req.params.consumerId);
  if (!profile) {
    return res.send(apiErrorResult('Not Found', null, HttpStatusCode.NotFound));
  }
  return res.send(apiSuccessResult(profile));
}

export async function handleRegisterConsumer(
  req: Request<{ consumerId: string }>,
  res: Response
) {
  const authProfileAndToken: AuthProfileAndToken | null = getAuth(req);

  if (!authProfileAndToken) {
    const apiResponseError = apiResponseErrors.DIGID_AUTH;
    captureMessage(
      `AMSAPP Notificaties handleRegisterConsumer: ${apiResponseError.message}`
    );
    return res.render(
      'amsapp-open-app',
      getRenderPropsForApiError(req.params.consumerId, apiResponseError)
    );
  }

  let profileName: string = 'no-name';

  const brpResponse = await fetchBrpByBsn(authProfileAndToken.profile.sid, [
    authProfileAndToken.profile.id,
  ]);

  if (brpResponse.status === 'OK' && brpResponse.content?.personen?.length) {
    const lastname = brpResponse.content.personen[0].naam.voorvoegsel
      ? `${brpResponse.content.personen[0].naam.voorvoegsel} ${brpResponse.content.personen[0].naam.geslachtsnaam ?? ''}`
      : (brpResponse.content.personen[0].naam.geslachtsnaam ?? '');
    profileName = `${brpResponse.content.personen[0].naam.voorletters ?? ''} ${lastname}`;
  }

  try {
    await registerConsumer(
      authProfileAndToken.profile.id,
      profileName,
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
    const apiResponseError =
      apiResponseErrors.AMSAPP_NOTIFICATIONS_CONSUMER_REGISTRATION_FAILED;
    captureMessage(
      `AMSAPP Notificaties handleRegisterConsumer: ${apiResponseError.message} ${error}`
    );
    return res.render(
      'amsapp-open-app',
      getRenderPropsForApiError(req.params.consumerId, apiResponseError)
    );
  }

  const renderProps: RenderProps = {
    ...baseRenderProps,
    appHref: `${AMSAPP_NOTIFICATIONS_DEEP_LINK_BASE}/gelukt`,
    promptOpenApp: false, // We want the user to be redirected to logout first.
    identifier: !IS_PRODUCTION ? req.params.consumerId : '',
  };

  return res.render('amsapp-open-app', renderProps);
}

// This endpoint has a long execution time, making it impractical to await.
// A success response is send to indicate it has started.
export function fetchAndStoreNotifications(_req: Request, res: Response) {
  batchFetchAndStoreNotifications();
  return res.send(apiSuccessResult('success'));
}

export async function handleTruncateNotifications(
  _req: Request,
  res: Response
) {
  try {
    await batchDeleteNotifications();
  } catch (error) {
    const apiResponseError =
      apiResponseErrors.AMSAPP_NOTIFICATIONS_TRUNCATE_FAILED;
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

const handleSendNotificationsResponseParams = z.object({
  dateFrom: z.iso.datetime().optional().default(getSevenDaysAgoISOString()),
  offset: z.coerce.number().min(0).optional().default(0),
  limit: z.coerce.number().min(1).optional().default(100),
});
export async function handleSendNotificationsResponse(
  req: RequestWithQueryParams<{
    dateFrom: string;
    offset: string;
    limit: string;
  }>,
  res: Response
) {
  const result = handleSendNotificationsResponseParams.safeParse(req.query);
  if (!result.success) {
    return sendBadRequestInvalidInput(res, result.error);
  }

  const { dateFrom, offset, limit } = result.data;

  const rowCount_ = getProfilesCount({
    dateFrom,
  });
  const response_ = batchFetchNotifications({
    dateFrom,
    offset,
    limit,
  });
  const [rowCount, response] = await Promise.all([rowCount_, response_]);

  return sendResponse(res, {
    ...apiSuccessResult(response),
    totalItems: rowCount,
  });
}

export const forTesting = {
  sendConsumerIdResponse: handleRegisterConsumer,
  fetchAndStoreNotifications,
  sendNotificationsResponse: handleSendNotificationsResponse,
};

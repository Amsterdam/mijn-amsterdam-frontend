import type { Request, Response } from 'express';

import { IS_PRODUCTION } from '../../../../universal/config/env';
import { apiSuccessResult } from '../../../../universal/helpers/api';
import { getAuth } from '../../../auth/auth-helpers';
import type { AuthProfileAndToken } from '../../../auth/auth-types';
import { encrypt, decrypt } from '../../../helpers/encrypt-decrypt';
import { requestData } from '../../../helpers/source-api-request';
import { sendResponse, sendBadRequest } from '../../../routing/route-helpers';
import { fetchAdministratienummer } from '../../hli/hli-zorgned-service';
import {
  fetchStadspasDiscountTransactions,
  fetchStadspasBudgetTransactions,
  blockStadspas,
} from '../../hli/stadspas';
import { fetchStadspassenByAdministratienummer } from '../../hli/stadspas-gpass-service';
import type {
  StadspasAMSAPPFrontend,
  TransactionKeysEncryptedWithoutSessionID,
  StadspasBudget,
} from '../../hli/stadspas-types';
import { captureMessage, captureException } from '../../monitoring';
import { baseRenderProps } from '../amsapp-service-config';
import {
  AMSAPP_STADSPAS_DEEP_LINK_BASE,
  apiResponseErrors,
  getAmsAppRequestConfig,
} from './amsapp-stadspas-service-config';
import type { ApiError, RenderProps } from '../amsapp-types';

export async function handleAdministratienummerExchange(
  req: Request<{ token: string }>,
  res: Response
) {
  const authProfileAndToken: AuthProfileAndToken | null = getAuth(req);
  let apiResponseError: ApiError = apiResponseErrors.UNKNOWN;

  if (!authProfileAndToken) {
    apiResponseError = apiResponseErrors.DIGID_AUTH;
  }

  if (
    authProfileAndToken?.profile.id &&
    authProfileAndToken.profile.profileType === 'private'
  ) {
    const administratienummerResponse = await fetchAdministratienummer(
      authProfileAndToken.profile.id
    );

    // Administratienummer found, encrypt and send
    if (
      administratienummerResponse.status === 'OK' &&
      administratienummerResponse.content !== null
    ) {
      const [administratienummerEncrypted] = encrypt(
        administratienummerResponse.content
      );

      const requestConfig = getAmsAppRequestConfig({
        data: {
          encrypted_administration_no: administratienummerEncrypted,
          session_token: req.params.token,
        },
      });

      // Deliver the token with administratienummer to app.amsterdam.nl
      const deliveryResponse = await requestData<{ detail?: 'Success' }>(
        requestConfig
      );

      if (
        deliveryResponse.status === 'OK' &&
        deliveryResponse.content?.detail === 'Success'
      ) {
        const renderProps: RenderProps = {
          ...baseRenderProps,
          promptOpenApp: false,
          appHref: `${AMSAPP_STADSPAS_DEEP_LINK_BASE}/gelukt`,
          identifier: !IS_PRODUCTION ? administratienummerEncrypted : '',
        };
        return res.render('amsapp-open-app', renderProps);
      }

      if (
        deliveryResponse.status === 'ERROR' ||
        deliveryResponse.content?.detail !== 'Success'
      ) {
        // Delivery response error
        apiResponseError =
          apiResponseErrors.AMSAPP_ADMINISTRATIENUMMER_DELIVERY_FAILED;
      }
    }

    // administratienummer not found in Zorgned
    if (!administratienummerResponse.content) {
      apiResponseError = apiResponseErrors.ADMINISTRATIENUMMER_NOT_FOUND;
    }

    // administratienummer error Response
    if (administratienummerResponse.status === 'ERROR') {
      apiResponseError = apiResponseErrors.ADMINISTRATIENUMMER_RESPONSE_ERROR;
    }
  }

  captureMessage(`AMSAPP Stadspas: ${apiResponseError.message}`);

  const renderProps: RenderProps = {
    ...baseRenderProps,
    error: apiResponseError,
    appHref: `${AMSAPP_STADSPAS_DEEP_LINK_BASE}/mislukt?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
    // If the Digid login failed we don't want the user to be redirected to logout. In this case we can open the app directly.
    // If the error is not related to the Digid login, the user must always be redirected to logout. See the amsapp-open-app.pug for logic on how we handle the redirection to logout vs opening the app directly.
    promptOpenApp: apiResponseError.code === apiResponseErrors.DIGID_AUTH.code,
  };

  return res.render('amsapp-open-app', renderProps);
}
export function sendAppLandingResponse(_req: Request, res: Response) {
  const renderProps: RenderProps = {
    ...baseRenderProps,
    promptOpenApp: true,
  };
  return res.render('amsapp-open-app', renderProps);
}
export async function sendStadspassenResponse(
  req: Request<{ administratienummerEncrypted: string }>,
  res: Response
) {
  let apiResponseError: ApiError = apiResponseErrors.UNKNOWN;
  let administratienummer: string | undefined = undefined;

  try {
    const administratienummerEncrypted =
      req.params.administratienummerEncrypted;

    administratienummer = decrypt(administratienummerEncrypted);
  } catch (error) {
    apiResponseError = apiResponseErrors.ADMINISTRATIENUMMER_FAILED_TO_DECRYPT;
    captureException(error);
  }

  if (administratienummer !== undefined) {
    const stadspassenResponse =
      await fetchStadspassenByAdministratienummer(administratienummer);

    if (stadspassenResponse.status === 'OK') {
      // Add transactionsKey to response
      const stadspassenTransformed: StadspasAMSAPPFrontend[] =
        stadspassenResponse.content.stadspassen.map((stadspas) => {
          const [transactionsKeyEncrypted] = encrypt(
            `${administratienummer}:${stadspas.passNumber}`
          );
          return {
            ...stadspas,
            // AMSAPP wants this extra field because GPASS promises to deliver this in the fourth quarter (Q4).
            transactionsKeyEncrypted,
          };
        });
      return res.send(apiSuccessResult(stadspassenTransformed));
    }

    // Return the error response
    return sendResponse(res, stadspassenResponse);
  }

  return sendBadRequest(
    res,
    `ApiError ${apiResponseError.code} - ${apiResponseError.message}`
  );
}
type TransactionKeysEncryptedRequest = Request<{
  transactionsKeyEncrypted: TransactionKeysEncryptedWithoutSessionID;
}>;
export async function sendDiscountTransactionsResponse(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const response = await fetchStadspasDiscountTransactions(
    req.params.transactionsKeyEncrypted
  );

  sendResponse(res, response);
}
/** Sends transformed budget transactions.
 *
 * # Url Params
 *
 *  `transactionsKeyEncrypted`: is available in the response of `sendStadspassenResponse`.
 */
export async function sendBudgetTransactionsResponse(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const response = await fetchStadspasBudgetTransactions(
    req.params.transactionsKeyEncrypted,
    req.query?.budgetCode as StadspasBudget['code']
  );

  return sendResponse(res, response);
}
export async function sendStadspasBlockRequest(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const response = await blockStadspas(req.params.transactionsKeyEncrypted);
  return sendResponse(res, response);
}

export const forTesting = {
  sendAdministratienummerResponse: handleAdministratienummerExchange,
  sendStadspassenResponse,
  sendDiscountTransactionsResponse,
  sendBudgetTransactionsResponse,
  sendStadspasBlockRequest,
};

import express, { Request, Response } from 'express';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER } from '../../auth/auth-config';
import { getAuth } from '../../auth/auth-helpers';
import { authRoutes } from '../../auth/auth-routes';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { ExternalConsumerEndpoints } from '../../routing/bff-routes';
import { apiKeyVerificationHandler } from '../../routing/middleware';
import { sendBadRequest, sendResponse } from '../../routing/helpers';
import { captureException, captureMessage } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import {
  fetchStadspasBudgetTransactions,
  fetchStadspasDiscountTransactions,
} from './stadspas';
import { fetchStadspassenByAdministratienummer } from './stadspas-gpass-service';
import { StadspasAMSAPPFrontend, StadspasBudget } from './stadspas-types';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_STADSPAS_DEEP_LINK = `${AMSAPP_PROTOCOl}stadspas`;
const AMSAPP_LINK_NONCE = 'h70yjZuEZl';

type ApiError = {
  code: string;
  message: string;
};

const apiResponseErrors: Record<string, ApiError> = {
  DIGID_AUTH: { code: '001', message: 'Niet ingelogd met Digid' },
  ADMINISTRATIENUMMER_RESPONSE_ERROR: {
    code: '002',
    message: 'Kon het administratienummer niet ophalen',
  },
  ADMINISTRATIENUMMER_NOT_FOUND: {
    code: '003',
    message: 'Geen administratienummer gevonden',
  },
  AMSAPP_DELIVERY_FAILED: {
    code: '004',
    message:
      'Verzenden van administratienummer naar de Amsterdam app niet gelukt',
  },
  ADMINISTRATIENUMMER_FAILED_TO_DECRYPT: {
    code: '005',
    message: `Could not decrypt url parameter 'administratienummerEncrypted'.`,
  },
  UNKNOWN: {
    code: '000',
    message: 'Onbekende fout',
  },
} as const;

export const routerInternet = express.Router();
export const routerPrivateNetwork = express.Router();

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_AMSAPP_LOGIN,
  async (req: Request<{ token: string }>, res: Response) => {
    return res.redirect(
      authRoutes.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER}&amsapp-session-token=${req.params.token}`
    );
  }
);

async function sendAdministratienummerResponse(
  req: Request<{ token: string }>,
  res: Response
) {
  let authProfileAndToken: AuthProfileAndToken | null = null;
  let apiResponseError: ApiError = apiResponseErrors.UNKNOWN;

  try {
    authProfileAndToken = await getAuth(req);
  } catch (error) {
    apiResponseError = apiResponseErrors.DIGID_AUTH;
  }

  if (
    authProfileAndToken?.profile.id &&
    authProfileAndToken.profile.profileType === 'private'
  ) {
    const administratienummerResponse = await fetchAdministratienummer(
      res.locals.requestID,
      authProfileAndToken
    );

    // Administratienummer found, encrypt and send
    if (
      administratienummerResponse.status === 'OK' &&
      administratienummerResponse.content !== null
    ) {
      const [administratienummerEncrypted] = encrypt(
        administratienummerResponse.content
      );

      const requestConfig = getApiConfig('AMSAPP', {
        data: {
          encrypted_administration_no: administratienummerEncrypted,
          session_token: req.params.token,
        },
      });

      // Deliver the token with administratienummer to app.amsterdam.nl
      const deliveryResponse = await requestData<{ detail: 'Success' }>(
        requestConfig,
        res.locals.requestID
      );

      if (
        deliveryResponse.status === 'OK' &&
        deliveryResponse.content.detail === 'Success'
      ) {
        return res.render('amsapp-stadspas-administratienummer', {
          appHref: `${AMSAPP_STADSPAS_DEEP_LINK}/gelukt`,
          nonce: AMSAPP_LINK_NONCE,
          administratienummerEncrypted: !IS_PRODUCTION
            ? administratienummerEncrypted
            : '',
        });
      }

      if (
        deliveryResponse.status === 'ERROR' ||
        deliveryResponse.content?.detail !== 'Success'
      ) {
        // Delivery response error
        apiResponseError = apiResponseErrors.AMSAPP_DELIVERY_FAILED;
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

  return res.render('amsapp-stadspas-administratienummer', {
    error: apiResponseError,
    appHref: `${AMSAPP_STADSPAS_DEEP_LINK}/mislukt?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
  });
}

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

async function sendStadspassenResponse(
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
    const stadspassenResponse = await fetchStadspassenByAdministratienummer(
      res.locals.requestID,
      administratienummer
    );

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
            securityCode: null,
            transactionsKeyEncrypted,
          };
        });
      return res.send(apiSuccessResult(stadspassenTransformed));
    }

    // Return the error response
    return res.send(stadspassenResponse);
  }

  return sendBadRequest(
    res,
    `ApiError ${apiResponseError.code} - ${apiResponseError.message}`,
    null
  );
}

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  sendStadspassenResponse
);

async function sendDiscountTransactionsResponse(
  req: Request<{ transactionsKeyEncrypted: string }>,
  res: Response
) {
  const response = await fetchStadspasDiscountTransactions(
    res.locals.requestID,
    req.params.transactionsKeyEncrypted
  );

  sendResponse(res, response);
}

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADSPAS_DISCOUNT_TRANSACTIONS,
  apiKeyVerificationHandler,
  sendDiscountTransactionsResponse
);

/** Sends transformed budget transactions.
 *
 * # Url Params
 *
 *  `transactionsKeyEncrypted`: is available in the response of `sendStadspassenResponse`.
 */
async function sendBudgetTransactionsResponse(
  req: Request<{ transactionsKeyEncrypted: string }>,
  res: Response
) {
  const response = await fetchStadspasBudgetTransactions(
    res.locals.requestID,
    req.params.transactionsKeyEncrypted,
    req.query?.budgetCode as StadspasBudget['code']
  );

  return sendResponse(res, response);
}

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADSPAS_BUDGET_TRANSACTIONS,
  apiKeyVerificationHandler,
  sendBudgetTransactionsResponse
);

export const stadspasExternalConsumerRouter = {
  internet: routerInternet,
  privateNetwork: routerPrivateNetwork,
};

export const forTesting = {
  sendAdministratienummerResponse,
  sendStadspassenResponse,
  sendDiscountTransactionsResponse,
  sendBudgetTransactionsResponse,
};

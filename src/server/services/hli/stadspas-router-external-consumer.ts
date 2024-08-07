import express, { Request, Response } from 'express';
import { apiSuccessResult } from '../../../universal/helpers/api';
import {
  BffEndpoints,
  ExternalConsumerEndpoints,
  getApiConfig,
  STADSPASSEN_ENDPOINT_PARAMETER,
} from '../../config';
import {
  AuthProfileAndToken,
  getAuth,
  sendBadRequest,
  sendResponse,
} from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER } from '../../helpers/auth';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { apiKeyVerificationHandler } from '../../middleware';
import { captureException, captureMessage } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import { fetchStadspasTransactions } from './stadspas';
import { fetchStadspassenByAdministratienummer } from './stadspas-gpass-service';
import { StadspasAMSAPPFrontend, StadspasBudget } from './stadspas-types';
import { IS_PRODUCTION } from '../../../universal/config/env';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_STADSPAS_DEEP_LINK = `${AMSAPP_PROTOCOl}stadspas`;

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
    message: `Could not decrypt url parameter '${STADSPASSEN_ENDPOINT_PARAMETER}'.`,
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
      BffEndpoints.AUTH_LOGIN_DIGID +
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
          appHref: `${AMSAPP_STADSPAS_DEEP_LINK}`,
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
    appHref: `${AMSAPP_STADSPAS_DEEP_LINK}?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
  });
}

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

async function sendStadspassenResponse(
  req: Request<{ [STADSPASSEN_ENDPOINT_PARAMETER]: string }>,
  res: Response
) {
  let apiResponseError: ApiError = apiResponseErrors.UNKNOWN;
  let administratienummer: string | undefined = undefined;

  try {
    const administratienummerEncrypted =
      req.params[STADSPASSEN_ENDPOINT_PARAMETER];

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
  const response = await fetchStadspasTransactions(
    res.locals.requestID,
    req.params.transactionsKeyEncrypted,
    req.query?.budgetCode as StadspasBudget['code']
  );

  return sendResponse(res, response);
}

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADPAS_BUDGET_TRANSACTIES,
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
  sendBudgetTransactionsResponse,
};

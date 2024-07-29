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
  sendUnauthorized,
} from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER } from '../../helpers/auth';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { apiKeyVerificationHandler } from '../../middleware';
import { captureException } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import { fetchStadspasTransactions } from './stadspas';
import { fetchStadspassenByAdministratienummer } from './stadspas-gpass-service';
import { StadspasAMSAPPFrontend, StadspasBudget } from './stadspas-types';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_STADSPAS_DEEP_LINK = `${AMSAPP_PROTOCOl}stadspas`;

type ApiError = {
  code: string;
  message: string;
};

const errors: Record<string, ApiError> = {
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
    message: `Could not decrypt url parameter: '${STADSPASSEN_ENDPOINT_PARAMETER}'.`,
  },
  UNKNOWN: {
    code: '000',
    message: 'Onbekende error',
  },
} as const;

export const router = express.Router();

router.get(
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
  let error: ApiError = errors.UNKNOWN;

  try {
    authProfileAndToken = await getAuth(req);
  } catch (error) {
    error = errors.DIGID_AUTH;
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
      const deliveryResponse = await requestData<{ result: 'success' }>(
        requestConfig,
        res.locals.requestID
      );

      if (
        deliveryResponse.status === 'OK' &&
        deliveryResponse.content.result === 'success'
      ) {
        return res.render('amsapp-stadspas-administratienummer', {
          appHref: `${AMSAPP_STADSPAS_DEEP_LINK}`,
        });
      }

      if (
        deliveryResponse.status === 'ERROR' ||
        deliveryResponse.content?.result !== 'success'
      ) {
        // Delivery response error
        error = errors.AMSAPP_DELIVERY_FAILED;
      }
    }

    // administratienummer not found in Zorgned
    if (!administratienummerResponse.content) {
      error = errors.ADMINISTRATIENUMMER_NOT_FOUND;
    }

    // administratienummer error Response
    if (administratienummerResponse.status === 'ERROR') {
      error = errors.ADMINISTRATIENUMMER_RESPONSE_ERROR;
    }

    if (error) {
      return res.render('amsapp-stadspas-administratienummer', {
        error: error,
        appHref: `${AMSAPP_STADSPAS_DEEP_LINK}?errorMessage=${error.message}&errorCode=${error.code}`,
      });
    }
  }

  return sendUnauthorized(res);
}

router.get(
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

async function sendStadspassenResponse(
  req: Request<{ [STADSPASSEN_ENDPOINT_PARAMETER]: string }>,
  res: Response
) {
  let error: ApiError = errors.UNKNOWN;

  try {
    const administratienummerEncrypted =
      req.params[STADSPASSEN_ENDPOINT_PARAMETER];

    const administratienummer = decrypt(administratienummerEncrypted);
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
  } catch (error) {
    error = errors.ADMINISTRATIENUMMER_FAILED_TO_DECRYPT;
    captureException(error);
  }

  return sendBadRequest(res, error.message, error);
}

router.get(
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
    req.query.budgetCode as StadspasBudget['code']
  );

  return res.send(response);
}

router.get(
  ExternalConsumerEndpoints.private.STADPAS_BUDGET_TRANSACTIES,
  apiKeyVerificationHandler,
  sendBudgetTransactionsResponse
);

export const stadspasExternalConsumerRouter = router;

export const forTesting = {
  sendAdministratienummerResponse,
  sendStadspassenResponse,
};

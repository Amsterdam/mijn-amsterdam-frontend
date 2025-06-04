import { Request, Response } from 'express';

import { ExternalConsumerEndpoints } from './bff-routes';
import { apiKeyVerificationHandler } from './route-handlers';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
  sendBadRequest,
  sendResponse,
} from './route-helpers';
import { IS_PRODUCTION } from '../../universal/config/env';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
  RETURNTO_AMSAPP_STADSPAS_APP_LANDING,
} from '../auth/auth-config';
import { getAuth } from '../auth/auth-helpers';
import { authRoutes } from '../auth/auth-routes';
import { AuthProfileAndToken } from '../auth/auth-types';
import { decrypt, encrypt } from '../helpers/encrypt-decrypt';
import { getFromEnv } from '../helpers/env';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';
import { fetchAdministratienummer } from '../services/hli/hli-zorgned-service';
import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  fetchStadspasDiscountTransactions,
} from '../services/hli/stadspas';
import { fetchStadspassenByAdministratienummer } from '../services/hli/stadspas-gpass-service';
import {
  StadspasAMSAPPFrontend,
  StadspasBudget,
  TransactionKeysEncryptedWithoutSessionID,
} from '../services/hli/stadspas-types';
import { captureException, captureMessage } from '../services/monitoring';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_STADSPAS_DEEP_LINK = `${AMSAPP_PROTOCOl}stadspas`;

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerInternet = createBFFRouter({
  id: 'external-consumer-public',
});

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_AMSAPP_LOGIN,
  async (req: Request<{ token: string }>, res: Response) => {
    return res.redirect(
      authRoutes.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER}&amsapp-session-token=${req.params.token}`
    );
  }
);

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_APP_LANDING,
  sendAppLandingResponse
);

// PRIVATE NETWORK ROUTER
// ======================
export const routerPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network',
});

export const stadspasExternalConsumerRouter = {
  internet: routerInternet,
  privateNetwork: routerPrivateNetwork,
};

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  sendStadspassenResponse
);

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADSPAS_DISCOUNT_TRANSACTIONS,
  apiKeyVerificationHandler,
  sendDiscountTransactionsResponse
);

routerPrivateNetwork.get(
  ExternalConsumerEndpoints.private.STADSPAS_BUDGET_TRANSACTIONS,
  apiKeyVerificationHandler,
  sendBudgetTransactionsResponse
);

routerPrivateNetwork.post(
  ExternalConsumerEndpoints.private.STADSPAS_BLOCK_PAS,
  apiKeyVerificationHandler,
  sendStadspasBlockRequest
);

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

type RenderProps = {
  nonce: string;
  promptOpenApp: boolean;
  urlToImage: string;
  urlToCSS: string;
  error?: ApiError;
  administratienummerEncrypted?: string; // Only included in debug build.
  appHref?: `${typeof AMSAPP_STADSPAS_DEEP_LINK}/${'gelukt' | 'mislukt'}${string}`;
};

const maFrontendUrl = getFromEnv('MA_FRONTEND_URL')!;
const nonce = getFromEnv('BFF_AMSAPP_NONCE')!;
const logoutUrl = `${generateFullApiUrlBFF(
  authRoutes.AUTH_LOGOUT_DIGID,
  {},
  getFromEnv('BFF_OIDC_BASE_URL')
)}?returnTo=${RETURNTO_AMSAPP_STADSPAS_APP_LANDING}`;

const baseRenderProps = {
  nonce,
  urlToImage: `${maFrontendUrl}/img/logo-amsterdam.svg`,
  urlToCSS: `${maFrontendUrl}/css/amsapp-landing.css`,
  logoutUrl,
};

async function sendAdministratienummerResponse(
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

      const requestConfig = getApiConfig('AMSAPP', {
        data: {
          encrypted_administration_no: administratienummerEncrypted,
          session_token: req.params.token,
        },
      });

      // Deliver the token with administratienummer to app.amsterdam.nl
      const deliveryResponse = await requestData<{ detail: 'Success' }>(
        requestConfig
      );

      if (
        deliveryResponse.status === 'OK' &&
        deliveryResponse.content.detail === 'Success'
      ) {
        const renderProps: RenderProps = {
          ...baseRenderProps,
          promptOpenApp: false,
          appHref: `${AMSAPP_STADSPAS_DEEP_LINK}/gelukt`,
          administratienummerEncrypted: !IS_PRODUCTION
            ? administratienummerEncrypted
            : '',
        };
        return res.render('amsapp-stadspas-administratienummer', renderProps);
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

  const renderProps: RenderProps = {
    ...baseRenderProps,
    error: apiResponseError,
    appHref: `${AMSAPP_STADSPAS_DEEP_LINK}/mislukt?errorMessage=${encodeURIComponent(apiResponseError.message)}&errorCode=${apiResponseError.code}`,
    // No need to redirect to logout as 001 error code means user is not logged in with Digid.
    promptOpenApp: apiResponseError.code === apiResponseErrors.DIGID_AUTH.code,
  };

  return res.render('amsapp-stadspas-administratienummer', renderProps);
}

function sendAppLandingResponse(_req: Request, res: Response) {
  const renderProps: RenderProps = {
    ...baseRenderProps,
    promptOpenApp: true,
  };
  return res.render('amsapp-stadspas-administratienummer', renderProps);
}

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
    `ApiError ${apiResponseError.code} - ${apiResponseError.message}`,
    null
  );
}

type TransactionKeysEncryptedRequest = Request<{
  transactionsKeyEncrypted: TransactionKeysEncryptedWithoutSessionID;
}>;

async function sendDiscountTransactionsResponse(
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
async function sendBudgetTransactionsResponse(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const response = await fetchStadspasBudgetTransactions(
    req.params.transactionsKeyEncrypted,
    req.query?.budgetCode as StadspasBudget['code']
  );

  return sendResponse(res, response);
}

async function sendStadspasBlockRequest(
  req: TransactionKeysEncryptedRequest,
  res: Response
) {
  const response = await blockStadspas(req.params.transactionsKeyEncrypted);
  return sendResponse(res, response);
}

export const forTesting = {
  sendAdministratienummerResponse,
  sendStadspassenResponse,
  sendDiscountTransactionsResponse,
  sendBudgetTransactionsResponse,
  sendStadspasBlockRequest,
};

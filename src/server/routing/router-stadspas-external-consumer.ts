import { Request, Response } from 'express';

import { ExternalConsumerEndpoints } from './bff-routes.ts';
import { apiKeyVerificationHandler } from './route-handlers.ts';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
  sendBadRequest,
  sendResponse,
} from './route-helpers.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { apiSuccessResult } from '../../universal/helpers/api.ts';
import {
  RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
  RETURNTO_AMSAPP_STADSPAS_APP_LANDING,
} from '../auth/auth-config.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import { AuthProfileAndToken } from '../auth/auth-types.ts';
import { decrypt, encrypt } from '../helpers/encrypt-decrypt.ts';
import { getFromEnv } from '../helpers/env.ts';
import { getApiConfig } from '../helpers/source-api-helpers.ts';
import { requestData } from '../helpers/source-api-request.ts';
import { fetchAdministratienummer } from '../services/hli/hli-zorgned-service.ts';
import { fetchStadspassenByAdministratienummer } from '../services/hli/stadspas-gpass-service.ts';
import {
  StadspasAMSAPPFrontend,
  StadspasBudget,
  TransactionKeysEncryptedWithoutSessionID,
} from '../services/hli/stadspas-types.ts';
import {
  blockStadspas,
  fetchStadspasBudgetTransactions,
  fetchStadspasDiscountTransactions,
} from '../services/hli/stadspas.ts';
import { captureException, captureMessage } from '../services/monitoring.ts';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_STADSPAS_DEEP_LINK = `${AMSAPP_PROTOCOl}stadspas`;

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerInternet = createBFFRouter({
  id: 'external-consumer-public-stadspas',
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
  public: routerInternet,
  private: routerPrivateNetwork,
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
  identifier?: string; // Only included in debug build.
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
          identifier: !IS_PRODUCTION ? administratienummerEncrypted : '',
        };
        return res.render('amsapp-open-app', renderProps);
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

  return res.render('amsapp-open-app', renderProps);
}

function sendAppLandingResponse(_req: Request, res: Response) {
  const renderProps: RenderProps = {
    ...baseRenderProps,
    promptOpenApp: true,
  };
  return res.render('amsapp-open-app', renderProps);
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

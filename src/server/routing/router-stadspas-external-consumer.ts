import express, { Request, Response } from 'express';

import { ExternalConsumerEndpoints } from './bff-routes';
import { apiKeyVerificationHandler } from './route-handlers';
import {
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
  fetchStadspasBudgetTransactions,
  fetchStadspasDiscountTransactions,
} from '../services/hli/stadspas';
import { fetchStadspassenByAdministratienummer } from '../services/hli/stadspas-gpass-service';
import {
  StadspasAMSAPPFrontend,
  StadspasBudget,
} from '../services/hli/stadspas-types';
import { captureException, captureMessage } from '../services/monitoring';

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
    message: `Could not decrypt url parameter 'administratienummerEncrypted'.`,
  },
  UNKNOWN: {
    code: '000',
    message: 'Onbekende fout',
  },
} as const;

export const routerInternet = express.Router();
routerInternet.BFF_ID = 'external-consumer-public';

export const routerPrivateNetwork = express.Router();
routerPrivateNetwork.BFF_ID = 'external-consumer-private-network';

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_AMSAPP_LOGIN,
  async (req: Request<{ token: string }>, res: Response) => {
    return res.redirect(
      authRoutes.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER}&amsapp-session-token=${req.params.token}`
    );
  }
);

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
    appHref: `${AMSAPP_STADSPAS_DEEP_LINK}/mislukt?errorCode=${apiResponseError.code}&errorMessage=${apiResponseError.message}`,
    // No need to redirect to logout as 001 error code means user is not logged in with Digid.
    promptOpenApp: apiResponseError.code === apiResponseErrors.DIGID_AUTH.code,
  };

  return res.render('amsapp-stadspas-administratienummer', renderProps);
}

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

function sendAppLandingResponse(_req: Request, res: Response) {
  const renderProps: RenderProps = {
    ...baseRenderProps,
    promptOpenApp: true,
  };
  return res.render('amsapp-stadspas-administratienummer', renderProps);
}

routerInternet.get(
  ExternalConsumerEndpoints.public.STADSPAS_APP_LANDING,
  sendAppLandingResponse
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

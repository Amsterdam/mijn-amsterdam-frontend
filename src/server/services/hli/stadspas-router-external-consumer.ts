import express, { Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers/api';
import {
  BffEndpoints,
  ExternalConsumerEndpoints,
  getApiConfig,
  STADSPASSEN_ENDPOINT_PARAMETER,
} from '../../config';
import {
  AuthProfileAndToken,
  getAuth,
  sendUnauthorized,
} from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER } from '../../helpers/auth';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { apiKeyVerificationHandler } from '../../middleware';
import { captureException } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import {
  fetchPasBudgetTransactions,
  fetchStadspassenByAdministratienummer,
  fetchTransacties,
} from './stadspas-gpass-service';
import { handleFetchTransactionsRequest } from './stadspas-route-handlers';

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
      administratienummerResponse.content
    ) {
      const [administratienummerEncrypted] =
        administratienummerResponse.content !== null
          ? encrypt(administratienummerResponse.content)
          : [];

      const requestConfig = getApiConfig('AMSAPP', {
        data: {
          administratienummerEncrypted,
          token: req.params.token,
        },
      });

      // Deliver the token with administratienummer to app.amsterdam.nl
      const deliveryResponse = await requestData(
        requestConfig,
        res.locals.requestID
      );

      if (deliveryResponse.status === 'OK') {
        // Send app protocol header, should open app
        return res.redirect(AMSAPP_STADSPAS_DEEP_LINK);
      }

      if (deliveryResponse.status === 'ERROR') {
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
      return res.redirect(
        `${AMSAPP_STADSPAS_DEEP_LINK}?errorMessage=${error.message}&errorCode=${error.code}`
      );
      // TODO: Check if the header option works like we want to, if not render the html, if works: remove pug
      // return res.render('amsapp-stadspas-administratienummer', {
      //   error: error,
      //   appHref: `${AMSAPP_STADSPAS_DEEP_LINK}?errorMessage=${error.message}&errorCode=${error.code}`,
      // });
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
  let reason = '';

  try {
    const administratienummerEncrypted =
      req.params[STADSPASSEN_ENDPOINT_PARAMETER];
    if (administratienummerEncrypted) {
      const administratienummer = decrypt(administratienummerEncrypted);
      const stadpassen = await fetchStadspassenByAdministratienummer(
        res.locals.requestID,
        administratienummer
      );
      return res.send(stadpassen);
    }
    reason = `Missing encrypted url parameter: '${STADSPASSEN_ENDPOINT_PARAMETER}'.`;
  } catch (error) {
    reason = `Could not decrypt url parameter: '${STADSPASSEN_ENDPOINT_PARAMETER}'.`;
    captureException(error);
  }

  return res.status(400).send(apiErrorResult(`Bad request: ${reason}`, null));
}

router.get(
  ExternalConsumerEndpoints.private.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  sendStadspassenResponse
);

async function sendBudgetTransactiesResponse(
  req: Request<{ pasNummer: string }>,
  res: Response
) {
  function sendBadRequest(reason: string) {
    return res.status(400).send(apiErrorResult(`Bad request: ${reason}`, null));
  }

  if (!req.params?.pasNummer || isNaN(Number(req.params.pasNummer))) {
    return sendBadRequest(
      'pasNummer in digit form required as an url parameter.'
    );
  }

  if (
    !req.body.administratieNummer ||
    typeof req.body.administratieNummer !== 'string'
  ) {
    return sendBadRequest(
      'administratieNummer in body required like so { administratieNummer: <string> }'
    );
  }

  // RP TODO: How to get requestID? now '1'
  const response = await fetchPasBudgetTransactions(
    '1',
    req.body.administratieNummber,
    req.params.pasNummer
  );

  return res.send(response);
}

router.get(
  ExternalConsumerEndpoints.private.STADPAS_TRANSACTIES,
  apiKeyVerificationHandler,
  sendBudgetTransactiesResponse
);

export const stadspasExternalConsumerRouter = router;

export const forTesting = {
  sendAdministratienummerResponse,
  sendStadspassenResponse,
};

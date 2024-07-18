import express, { NextFunction, Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers/api';
import { BffEndpoints, getApiConfig } from '../../config';
import {
  AuthProfileAndToken,
  getAuth,
  sendUnauthorized,
} from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER } from '../../helpers/auth';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import { requestData } from '../../helpers/source-api-request';

const AMSAPP_PROTOCOl = 'amsterdam://';
const AMSAPP_STADSPAS_DEEP_LINK = `${AMSAPP_PROTOCOl}stadspas`;

export const router = express.Router();

router.get(
  BffEndpoints.STADSPAS_AMSAPP_LOGIN,
  async (req: Request<{ token: string }>, res: Response) => {
    return res.redirect(
      BffEndpoints.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER}&amsapp-session-token=${req.params.token}`
    );
  }
);

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

    // Administratienummer found, encrypt and sent
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
  BffEndpoints.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

function apiKeyHandler(req: Request, res: Response, next: NextFunction) {
  // TODO: implement api key validation
  next();
}

router.get(
  BffEndpoints.STADSPAS_PASSEN,
  apiKeyHandler,
  (
    req: Request<{ administratienummerEncrypted: string }>,
    res: Response,
    next: NextFunction
  ) => {
    let reason = '';
    try {
      const administratienummerEncrypted =
        req.params.administratienummerEncrypted;

      if (administratienummerEncrypted) {
        const clientnummer = decrypt(administratienummerEncrypted);
        // TODO: Implement service call with clientnummer param
        return res.send({
          clientnummer,
          passen: [],
        });
      }
      reason = 'missing encrypted param';
    } catch (error) {
      reason = 'wrong encryption';
      captureException(error);
    }
    return res.status(400).send(apiErrorResult(`Bad request: ${reason}`, null));
  }
);

export const stadspasExternalConsumerRouter = router;

export const forTesting = {
  sendAdministratienummerResponse,
};

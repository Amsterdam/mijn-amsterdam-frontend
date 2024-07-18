import express, { NextFunction, Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers/api';
import { BffEndpoints, ExternalConsumerEndpoints } from '../../config';
import {
  AuthProfileAndToken,
  getAuth,
  sendUnauthorized,
} from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER } from '../../helpers/auth';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import { fetchStadspassenByAdministratienummer } from '../hli/hli-zorgned-service';
import { apiKeyVerificationHandler } from '../../middleware';

const AMSAPP_PROTOCOl = 'amsterdam://';

export const router = express.Router();

router.get(
  ExternalConsumerEndpoints.STADSPAS_AMSAPP_LOGIN,
  async (req: Request, res: Response) => {
    return res.redirect(
      BffEndpoints.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER}`
    );
  }
);

async function sendAdministratienummerResponse(req: Request, res: Response) {
  let authProfileAndToken: AuthProfileAndToken | null = null;
  try {
    authProfileAndToken = await getAuth(req);
  } catch (error) {}

  if (
    authProfileAndToken?.profile.id &&
    authProfileAndToken.profile.profileType === 'private'
  ) {
    const clientNummerResponse = await fetchAdministratienummer(
      res.locals.requestID,
      authProfileAndToken
    );

    if (clientNummerResponse.status === 'OK') {
      const [administratienummerEncrypted] =
        clientNummerResponse.content !== null
          ? encrypt(clientNummerResponse.content)
          : [];
      return res.render('amsapp-stadspas-administratienummer', {
        administratienummerEncrypted,
        AMSAPP_PROTOCOl,
      });
    }

    if (clientNummerResponse.status === 'ERROR') {
      return res.render('amsapp-stadspas-administratienummer', {
        error:
          clientNummerResponse.message ??
          'Administratienummer kon niet worden opgehaald',
        AMSAPP_PROTOCOl,
      });
    }
  }

  return sendUnauthorized(res);
}

router.get(
  ExternalConsumerEndpoints.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

function apiKeyHandler(req: Request, res: Response, next: NextFunction) {
  // TODO: implement api key validation
  next();
}

router.get(
  ExternalConsumerEndpoints.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  async (
    req: Request<{ administratienummerEncrypted: string }>,
    res: Response,
    next: NextFunction
  ) => {
    let reason = '';
    try {
      const administratienummerEncrypted =
        req.params.administratienummerEncrypted;

      if (administratienummerEncrypted) {
        const administratienummer = decrypt(administratienummerEncrypted);
        const stadpassen = await fetchStadspassenByAdministratienummer(
          res.locals.requestID,
          administratienummer
        );
        return res.send(stadpassen);
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

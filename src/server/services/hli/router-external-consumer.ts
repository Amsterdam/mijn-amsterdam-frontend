import express, { NextFunction, Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers/api';
import {
  BffEndpoints,
  ExternalConsumerEndpoints,
  STADSPASSEN_ENDPOINT_PARAMETER,
} from '../../config';
import {
  AuthProfileAndToken,
  getAuth,
  sendUnauthorized,
} from '../../helpers/app';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER } from '../../helpers/auth';
import { captureException } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
import { apiKeyVerificationHandler } from '../../middleware';
import { fetchStadspassenByAdministratienummer } from './stadspas-gpass-service';

const AMSAPP_PROTOCOl = 'amsterdam://';

const router = express.Router();

router.get(
  ExternalConsumerEndpoints.public.STADSPAS_AMSAPP_LOGIN,
  async (req: Request, res: Response) => {
    return res.redirect(
      BffEndpoints.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER}`
    );
  }
);

router.get(
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
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
  ExternalConsumerEndpoints.private.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  sendStadspassenResponse
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

export const stadspasExternalConsumerRouter = router;

export const forTesting = {
  sendAdministratienummerResponse,
  sendStadspassenResponse,
};

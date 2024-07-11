import express, { NextFunction, Request, Response } from 'express';
import { apiErrorResult } from '../../../universal/helpers/api';
import { BffEndpoints, ExternalConsumerEndpoints } from '../../config';
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
  ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
  sendAdministratienummerResponse
);

async function sendStadspassenResponse(
  req: Request<{ administratienummerEncrypted: string }>,
  res: Response
) {
  let reason = '';
  try {
    const amdministratienummerEncrypted =
      req.params.administratienummerEncrypted;

    if (amdministratienummerEncrypted) {
      const administratienummer = decrypt(amdministratienummerEncrypted);
      const stadpassen = await fetchStadspassenByAdministratienummer(
        res.locals.requestID,
        administratienummer
      );
      return res.send(stadpassen);
    }
    reason = 'missing encrypted param';
  } catch (error) {
    reason = 'could not decrypt param';
    captureException(error);
  }
  return res.status(400).send(apiErrorResult(`Bad request: ${reason}`, null));
}

router.get(
  ExternalConsumerEndpoints.private.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  sendStadspassenResponse
);

export const stadspasExternalConsumerRouter = router;

export const forTesting = {
  sendAdministratienummerResponse,
  sendStadspassenResponse,
};

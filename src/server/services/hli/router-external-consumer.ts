import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from '../../config';
import { getAuth, sendUnauthorized } from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER } from '../../helpers/auth';
import { fetchClientNummer } from './hli-zorgned-service';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { apiErrorResult } from '../../../universal/helpers';

const AMSAPP_PROTOCOl = 'amsterdam://';

export const router = express.Router();

router.get(
  BffEndpoints.STADSPAS_AMSAPP_LOGIN,
  async (req: Request, res: Response) => {
    return res.redirect(
      BffEndpoints.AUTH_LOGIN_DIGID +
        `?returnTo=${RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER}`
    );
  }
);

router.get(
  BffEndpoints.STADSPAS_CLIENTNUMMER,
  async (req: Request, res: Response) => {
    const authProfileAndToken = await getAuth(req);

    if (
      authProfileAndToken.profile.id &&
      authProfileAndToken.profile.profileType === 'private'
    ) {
      const clientNummerResponse = await fetchClientNummer(
        res.locals.requestID,
        authProfileAndToken
      );

      if (clientNummerResponse.status === 'OK') {
        const [clientnummerEncrypted] =
          clientNummerResponse.content !== null
            ? encrypt(clientNummerResponse.content)
            : [];
        return res.render('amsapp-stadspas-clientnummer', {
          sid: authProfileAndToken.profile.sid,
          clientnummerEncrypted,
          AMSAPP_PROTOCOl,
        });
      }
    }

    return sendUnauthorized(res);
  }
);

function apiKeyHandler(req: Request, res: Response, next: NextFunction) {
  // TODO: implement api key validation
  next();
}

router.get(
  BffEndpoints.STADSPAS_PASSEN,
  apiKeyHandler,
  (
    req: Request<{ clientNummerEncrypted: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const clientNummerEncrypted = req.params.clientNummerEncrypted;

      if (clientNummerEncrypted) {
        const clientnummer = decrypt(clientNummerEncrypted);
        // TODO: Implement service call with clientnummer param
        return res.send({
          clientnummer,
          passen: [],
        });
      }
    } catch (error) {
      return res.status(400).send(apiErrorResult('Bad request', null));
    }
  }
);

export const stadspasExternalConsumerRouter = router;

export const router = express.Router();
import express, { Request, Response } from 'express';
import { BffEndpoints } from '../../config';
import {
  generateFullApiUrlBFF,
  getAuth,
  sendUnauthorized,
} from '../../helpers/app';
import { RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER } from '../../helpers/auth';
import { fetchClientNummer } from './hli-zorgned-service';

router.get(
  BffEndpoints.STADSPAS_AMSAPP_LOGIN,
  async (req: Request, res: Response) => {
    return res.redirect(
      generateFullApiUrlBFF(BffEndpoints.AUTH_LOGIN_DIGID) +
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
        return res.send(clientNummerResponse);
      }
    }

    return sendUnauthorized(res);
  }
);

export const router = express.Router();
import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from '../../config';
import {
  getAuth,
  isRequestAuthenticated,
  sendUnauthorized,
} from '../../helpers/app';
import { fetchClientNummer } from './hli-zorgned-service';

router.get(
  BffEndpoints.STADSPAS_CLIENTNUMMER,
  async (req: Request, res: Response, next: NextFunction) => {
    const authProfileAndToken = await getAuth(req);
    if (
      authProfileAndToken.profile.id &&
      authProfileAndToken.profile.profileType === 'private'
    ) {
      return fetchClientNummer(res.locals.requestID, authProfileAndToken);
    }
    return sendUnauthorized(res);
  }
);

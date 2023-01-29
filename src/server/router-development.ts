import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import path from 'path';
import { apiSuccessResult } from '../universal/helpers';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  RelayPathsAllowed,
} from './config';
import { AuthProfile, generateDevSessionCookieValue } from './helpers/app';
import VERGUNNINGEN_LIST_DOCUMENTS from './mock-data/json/vergunningen-documenten.json';
import STADSPAS_TRANSACTIES from './mock-data/json/stadspas-transacties.json';
import { countLoggedInVisit } from './services/visitors';
import { DEV_USER_ID, testAccounts } from '../universal/config';

export const authRouterDevelopment = express.Router();

authRouterDevelopment.get(
  '/api/v1/dev/auth/:authMethod/login/:user',
  (req: Request, res: Response, next: NextFunction) => {
    const appSessionCookieOptions: CookieOptions = {
      expires: new Date(
        new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * 1000 * 2000
      ),
      httpOnly: true,
      sameSite: false,
    };
    const authMethod = req.params.authMethod as AuthProfile['authMethod'];
    const userId = testAccounts[req.params.user] ?? DEV_USER_ID;
    const appSessionCookieValue = generateDevSessionCookieValue(
      authMethod,
      userId
    );

    countLoggedInVisit(userId);

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    return res.redirect(
      `${process.env.BFF_FRONTEND_URL}?authMethod=${req.params.authMethod}`
    );
  }
);

authRouterDevelopment.get('/api/v1/dev/auth/logout', (req, res) => {
  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});

export const relayDevRouter = express.Router();

relayDevRouter.get(RelayPathsAllowed.TIP_IMAGES, (req, res, next) => {
  return res.sendFile(
    path.join(
      __dirname,
      'mock-data/tip-image-mock.' + req.path.split('.').pop()
    )
  );
});

relayDevRouter.get(
  [
    RelayPathsAllowed.WPI_DOCUMENT_DOWNLOAD,
    RelayPathsAllowed.VERGUNNINGEN_DOCUMENT_DOWNLOAD,
  ],
  (req, res, next) => {
    return res.sendFile(path.join(__dirname, 'mock-data/document.pdf'));
  }
);

relayDevRouter.post(RelayPathsAllowed.BRP_BEWONERS, (req, res) => {
  return res.send(apiSuccessResult({ residentCount: 3 }));
});

relayDevRouter.get(RelayPathsAllowed.WPI_STADSPAS_TRANSACTIES, (req, res) => {
  return res.send(apiSuccessResult(STADSPAS_TRANSACTIES));
});

relayDevRouter.get(
  RelayPathsAllowed.VERGUNNINGEN_LIST_DOCUMENTS,
  (req, res) => {
    return res.send(VERGUNNINGEN_LIST_DOCUMENTS);
  }
);

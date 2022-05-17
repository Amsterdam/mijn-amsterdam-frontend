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

export const authRouterDevelopment = express.Router();

authRouterDevelopment.get(
  '/api/v1/dev/auth/:authMethod/login',
  (req: Request, res: Response, next: NextFunction) => {
    const appSessionCookieOptions: CookieOptions = {
      expires: new Date(
        new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * 1000
      ),
      httpOnly: true,
      path: '/',
      secure: false, // Not secure for local development
      sameSite: 'lax',
    };
    const authMethod = req.params.authMethod as AuthProfile['authMethod'];
    const userId = `xxx-${authMethod}-xxx`;
    const appSessionCookieValue = generateDevSessionCookieValue(
      authMethod,
      userId
    );

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
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
  return res.send(
    apiSuccessResult([
      {
        id: 'xx1',
        title: 'Hema',
        amount: -31.3,
        date: '2020-01-04',
      },
      {
        id: 'xx2',
        title: 'Aktiesport',
        amount: 21.3,
        date: '2019-12-16',
      },
      {
        id: 'xx3',
        title: 'Hema',
        amount: -0.99,
        date: '2019-10-21',
      },
    ])
  );
});

relayDevRouter.get(
  RelayPathsAllowed.VERGUNNINGEN_LIST_DOCUMENTS,
  (req, res) => {
    return res.send(VERGUNNINGEN_LIST_DOCUMENTS);
  }
);

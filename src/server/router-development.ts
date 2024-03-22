import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import path from 'path';
import { testAccounts } from '../universal/config/auth.development';
import { apiSuccessResult } from '../universal/helpers';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  RelayPathsAllowed,
} from './config';
import {
  AuthProfile,
  getAuth,
  hasSessionCookie,
  sendUnauthorized,
} from './helpers/app';
import STADSPAS_TRANSACTIES from './mock-data/json/gpass-transacties.json';
import VERGUNNINGEN_LIST_DOCUMENTS from './mock-data/json/vergunningen-documenten.json';
import { countLoggedInVisit } from './services/visitors';
import { generateDevSessionCookieValue } from './helpers/app.development';
import { addToBlackList } from './services/session-blacklist';
import UID from 'uid-safe';

const DevelopmentRoutes = {
  DEV_LOGIN: '/api/v1/auth/:authMethod/login/:user?',
  DEV_LOGOUT: '/api/v1/auth/logout',
  DEV_AUTH_CHECK: '/api/v1/auth/check',
};

const PREDEFINED_REDIRECT_URLS = ['noredirect', '/api/v1/services/all'];

export const authRouterDevelopment = express.Router();

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_LOGIN,
  async (req: Request, res: Response, next: NextFunction) => {
    const appSessionCookieOptions: CookieOptions = {
      expires: new Date(
        new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * 1000 * 2000
      ),
      httpOnly: true,
      path: '/',
      secure: false, // Not secure for local development
      sameSite: 'lax',
    };
    const authMethod = req.params.authMethod as AuthProfile['authMethod'];
    const userName =
      req.params.user && req.params.user in testAccounts
        ? req.params.user
        : Object.keys(testAccounts)[0];
    const userId = testAccounts[userName];
    const sessionID = UID.sync(18);
    const appSessionCookieValue = await generateDevSessionCookieValue(
      authMethod,
      userId,
      sessionID
    );

    countLoggedInVisit(userId, authMethod);

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    const isValidRedirectOption = PREDEFINED_REDIRECT_URLS.includes(
      String(req.query.redirectUrl)
    );

    if (isValidRedirectOption && req.query.redirectUrl === 'noredirect') {
      return res.send('ok');
    }

    let redirectUrl =
      req.query.redirectUrl && isValidRedirectOption
        ? String(req.query.redirectUrl)
        : `${process.env.MA_FRONTEND_URL}?authMethod=${req.params.authMethod}`;

    switch (req.params.authMethod) {
      case 'yivi':
        redirectUrl = `${process.env.BFF_OIDC_YIVI_POST_LOGIN_REDIRECT}`;
        break;
    }

    return res.redirect(redirectUrl);
  }
);

authRouterDevelopment.get(DevelopmentRoutes.DEV_LOGOUT, async (req, res) => {
  const auth = await getAuth(req);
  if (auth.profile.sid) {
    await addToBlackList(auth.profile.sid);
  }
  res.clearCookie(OIDC_SESSION_COOKIE_NAME);

  let redirectUrl = `${process.env.MA_FRONTEND_URL}`;

  switch (auth.profile.authMethod) {
    case 'yivi':
      redirectUrl = `${process.env.BFF_OIDC_YIVI_POST_LOGOUT_REDIRECT}`;
      break;
  }

  return res.redirect(redirectUrl);
});

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_AUTH_CHECK,
  async (req, res) => {
    if (hasSessionCookie(req)) {
      try {
        const auth = await getAuth(req);
        return res.send(
          apiSuccessResult({
            isAuthenticated: true,
            profileType: auth.profile.profileType,
            authMethod: auth.profile.authMethod,
          })
        );
      } catch (error) {}
    }

    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

export const relayDevRouter = express.Router();

relayDevRouter.get(
  [
    RelayPathsAllowed.WPI_DOCUMENT_DOWNLOAD,
    RelayPathsAllowed.VERGUNNINGEN_DOCUMENT_DOWNLOAD,
    RelayPathsAllowed.LOOD_DOCUMENT_DOWNLOAD,
    RelayPathsAllowed.BEZWAREN_DOCUMENT,
    RelayPathsAllowed.WMO_DOCUMENT_DOWNLOAD,
  ],
  (req, res, next) => {
    return res.sendFile(path.join(__dirname, 'mock-data/document.pdf'));
  }
);

relayDevRouter.post(RelayPathsAllowed.BRP_BEWONERS, (req, res) => {
  return res.send(apiSuccessResult({ residentCount: 3 }));
});

relayDevRouter.get(RelayPathsAllowed.STADSPAS_TRANSACTIES, (req, res) => {
  return res.send(apiSuccessResult(STADSPAS_TRANSACTIES));
});

relayDevRouter.get(
  RelayPathsAllowed.VERGUNNINGEN_LIST_DOCUMENTS,
  (req, res) => {
    return res.send(VERGUNNINGEN_LIST_DOCUMENTS);
  }
);

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
  profileTypeByAuthMethod,
} from './config';
import { AuthProfile, getAuth, sendUnauthorized } from './helpers/app';
import { generateDevSessionCookieValue } from './helpers/app.development';
import STADSPAS_TRANSACTIES from './mock-data/json/stadspas-transacties.json';
import VERGUNNINGEN_LIST_DOCUMENTS from './mock-data/json/vergunningen-documenten.json';
import { countLoggedInVisit } from './services/visitors';

export const authRouterDevelopment = express.Router();

authRouterDevelopment.get(
  '/api/v1/auth/:authMethod/login/:user?',
  (req: Request, res: Response, next: NextFunction) => {
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
    const userName = req.params.user ?? Object.keys(testAccounts)[0];
    const userId = testAccounts[userName];
    const appSessionCookieValue = generateDevSessionCookieValue(
      authMethod,
      userId
    );

    countLoggedInVisit(userId, authMethod);

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    let redirectUrl = `${process.env.BFF_FRONTEND_URL}?authMethod=${req.params.authMethod}`;

    switch (req.params.authMethod) {
      case 'yivi':
        redirectUrl = `${process.env.BFF_OIDC_YIVI_POST_LOGIN_REDIRECT}`;
        break;
    }

    return res.redirect(redirectUrl);
  }
);

authRouterDevelopment.get(
  '/api/v1/auth/:authMethod/check',
  async (req, res) => {
    const auth = await getAuth(req);
    const authMethodParam = req.params.authMethod as AuthMethod;
    if (
      !!auth.token &&
      auth.profile.authMethod === authMethodParam &&
      !!profileTypeByAuthMethod?.[authMethodParam]?.length
    ) {
      return res.send(
        apiSuccessResult({
          isAuthenticated: true,
          profileType: profileTypeByAuthMethod[authMethodParam][0], // NOTE: Private-Commercial Not implemented
          authMethod: authMethodParam,
        })
      );
    }
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

authRouterDevelopment.get('/api/v1/auth/logout', async (req, res) => {
  const auth = await getAuth(req);

  res.clearCookie(OIDC_SESSION_COOKIE_NAME);

  let redirectUrl = `${process.env.BFF_FRONTEND_URL}`;

  switch (auth.profile.authMethod) {
    case 'yivi':
      redirectUrl = `${process.env.BFF_OIDC_YIVI_POST_LOGOUT_REDIRECT}`;
      break;
  }

  return res.redirect(redirectUrl);
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
    RelayPathsAllowed.LOOD_DOCUMENT_DOWNLOAD,
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

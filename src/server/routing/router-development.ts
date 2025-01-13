import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import UID from 'uid-safe';

import { DevelopmentRoutes, PREDEFINED_REDIRECT_URLS } from './bff-routes';
import { sendUnauthorized } from './route-helpers';
import {
  testAccountsDigid,
  testAccountsEherkenning,
} from '../../universal/config/auth.development';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  TOKEN_ID_ATTRIBUTE,
} from '../auth/auth-config';
import {
  getAuth,
  getReturnToUrl,
  hasSessionCookie,
} from '../auth/auth-helpers';
import { signDevelopmentToken } from '../auth/auth-helpers-development';
import { authRoutes } from '../auth/auth-routes';
import { AuthProfile } from '../auth/auth-types';
import { ONE_SECOND_MS } from '../config/app';
import { getFromEnv } from '../helpers/env';
import { countLoggedInVisit } from '../services/visitors';

export const authRouterDevelopment = express.Router();
authRouterDevelopment.BFF_ID = 'router-dev';

export async function createOIDCStub(req: Request, authProfile: AuthProfile) {
  const idAttr = TOKEN_ID_ATTRIBUTE[authProfile.authMethod];
  (req as any)[OIDC_SESSION_COOKIE_NAME] = {
    ...authProfile,
    TMASessionID: 'xx-tma-sid-xx',
  };

  req.oidc = {
    isAuthenticated() {
      return true;
    },
    async fetchUserInfo() {
      return {} as any; // UserInfoResponse
    },
    user: {
      [idAttr]: authProfile.id,
      sid: authProfile.sid,
    },
    idToken: await signDevelopmentToken(
      authProfile.authMethod,
      authProfile.id,
      'xx-tma-sid-xx'
    ),
  };
}

authRouterDevelopment.use(async (req, res, next) => {
  if (hasSessionCookie(req)) {
    const cookieValue = req.cookies[OIDC_SESSION_COOKIE_NAME];
    try {
      await createOIDCStub(
        req,
        JSON.parse(Buffer.from(cookieValue, 'base64').toString('ascii'))
      );
    } catch (error) {
      res.clearCookie(OIDC_SESSION_COOKIE_NAME);
      return sendUnauthorized(res);
    }
  }
  next();
});

const appSessionCookieOptions: CookieOptions = {
  expires: new Date(
    new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS
  ),
  httpOnly: true,
  path: '/',
  secure: false, // Not secure for local development
  sameSite: 'lax',
};

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_LOGIN,
  async (req: Request, res: Response, next: NextFunction) => {
    const authMethod = req.params.authMethod as AuthProfile['authMethod'];
    const testAccounts =
      authMethod === 'digid' ? testAccountsDigid : testAccountsEherkenning;
    const allUsernames = Object.keys(testAccounts);
    const userName =
      req.params.user && req.params.user in testAccounts
        ? req.params.user
        : allUsernames[0];

    if (!req.params.user && allUsernames.length > 1) {
      const list = Object.keys(testAccounts).map((userName) => {
        const queryEntries = Object.entries(req.query);
        const queryString = queryEntries.length
          ? `?${queryEntries.map(([key, val]) => `${key}=${val}`).join('&')}`
          : '';
        return `<li><a href=${authRoutes.AUTH_LOGIN_DIGID}/${userName}${queryString}>${userName}</a>`;
      });
      return res.send(
        `<div style="height:100vh;width:100vw;display:flex;justify-content:center;"><div><h1>Selecteer ${authMethod} test account.</h1><ul>${list}</ul></div></div>`
      );
    }

    const userId = testAccounts[userName];

    countLoggedInVisit(userId, authMethod);

    const SESSION_ID_BYTE_LENGTH = 18;
    const sessionID = UID.sync(SESSION_ID_BYTE_LENGTH);
    const authProfile: AuthProfile = {
      id: userId,
      authMethod,
      profileType: authMethod === 'digid' ? 'private' : 'commercial',
      sid: sessionID,
    };
    createOIDCStub(req, authProfile);

    const appSessionCookieValue = Buffer.from(
      JSON.stringify(authProfile)
    ).toString('base64');

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

    const redirectUrl =
      req.query.redirectUrl && isValidRedirectOption
        ? String(req.query.redirectUrl)
        : req.query.returnTo
          ? getReturnToUrl(req.query)
          : `${process.env.MA_FRONTEND_URL}?authMethod=${req.params.authMethod}`;

    return res.redirect(redirectUrl);
  }
);

authRouterDevelopment.get(
  [
    authRoutes.AUTH_LOGOUT,
    authRoutes.AUTH_LOGOUT_EHERKENNING,
    authRoutes.AUTH_LOGOUT_DIGID,
  ],
  async (req, res) => {
    res.clearCookie(OIDC_SESSION_COOKIE_NAME, {
      path: appSessionCookieOptions.path,
    });
    const returnTo = getReturnToUrl(req.query, getFromEnv('MA_FRONTEND_URL'));
    return res.redirect(returnTo);
  }
);

authRouterDevelopment.get(
  [
    authRoutes.AUTH_CHECK,
    authRoutes.AUTH_CHECK_EHERKENNING,
    authRoutes.AUTH_CHECK_DIGID,
  ],
  async (req, res) => {
    if (hasSessionCookie(req)) {
      const auth = getAuth(req);
      if (auth) {
        return res.send(
          apiSuccessResult({
            isAuthenticated: true,
            profileType: auth.profile.profileType,
            authMethod: auth.profile.authMethod,
          })
        );
      }
    }

    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

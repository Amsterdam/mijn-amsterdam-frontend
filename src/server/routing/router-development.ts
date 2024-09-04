import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import UID from 'uid-safe';
import { testAccounts } from '../../universal/config/auth.development';
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
import { addToBlackList } from '../services/session-blacklist';
import { countLoggedInVisit } from '../services/visitors';
import { DevelopmentRoutes, PREDEFINED_REDIRECT_URLS } from './bff-routes';
import { sendUnauthorized } from './route-helpers';

export const authRouterDevelopment = express.Router();

async function createOIDCStub(
  req: Request,
  res: Response,
  authProfile: AuthProfile
) {
  const idAttr = TOKEN_ID_ATTRIBUTE[authProfile.authMethod];
  (req as any)[OIDC_SESSION_COOKIE_NAME] = authProfile;

  req.oidc = {
    isAuthenticated() {
      return true;
    },
    async fetchUserInfo() {
      return {} as any; // UserInfoResponse
    },
    user: { [idAttr]: authProfile.id, sid: authProfile.sid },
    idToken: await signDevelopmentToken(
      authProfile.authMethod,
      authProfile.id,
      authProfile.sid
    ),
  };
}

authRouterDevelopment.use(async (req, res, next) => {
  if (hasSessionCookie(req)) {
    const cookieValue = req.cookies[OIDC_SESSION_COOKIE_NAME];
    await createOIDCStub(
      req,
      res,
      JSON.parse(Buffer.from(cookieValue, 'base64').toString('ascii'))
    );
  }
  next();
});

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

    if (!req.params.user) {
      const list = Object.keys(testAccounts).map((userName) => {
        const queryEntries = Object.entries(req.query);
        const queryString = queryEntries.length
          ? `?${queryEntries.map(([key, val]) => `${key}=${val}`).join('&')}`
          : '';
        return `<li><a href=${authRoutes.AUTH_LOGIN_DIGID}/${userName}${queryString}>${userName}</a>`;
      });
      return res.send(`<ul>${list}</ul>`);
    }

    const userId = testAccounts[userName];

    countLoggedInVisit(userId, authMethod);

    const sessionID = UID.sync(18);
    const authProfile: AuthProfile = {
      id: userId,
      authMethod,
      profileType: authMethod === 'digid' ? 'private' : 'commercial',
      sid: sessionID,
    };
    createOIDCStub(req, res, authProfile);

    const appSessionCookieValue = Buffer.from(
      JSON.stringify(authProfile)
    ).toString('base64');

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    console.log(OIDC_SESSION_COOKIE_NAME, 'xxx', appSessionCookieOptions);

    const isValidRedirectOption = PREDEFINED_REDIRECT_URLS.includes(
      String(req.query.redirectUrl)
    );

    if (isValidRedirectOption && req.query.redirectUrl === 'noredirect') {
      return res.send('ok');
    }

    let redirectUrl =
      req.query.redirectUrl && isValidRedirectOption
        ? String(req.query.redirectUrl)
        : req.query.returnTo
          ? getReturnToUrl(req.query)
          : `${process.env.MA_FRONTEND_URL}?authMethod=${req.params.authMethod}`;

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

  return res.redirect(redirectUrl);
});

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_AUTH_CHECK,
  async (req, res) => {
    console.log(
      res.locals.requestID,
      '\n===>>>>>>>\n auth check',
      (req as any).oidc
    );
    if (hasSessionCookie(req)) {
      console.log('session req', req.cookies);
      try {
        const auth = await getAuth(req);
        return res.send(
          apiSuccessResult({
            isAuthenticated: true,
            profileType: auth.profile.profileType,
            authMethod: auth.profile.authMethod,
          })
        );
      } catch (error) {
        console.log(error);
      }
    }

    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

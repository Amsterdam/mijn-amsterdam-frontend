import { differenceInSeconds } from 'date-fns';
import { CookieOptions, Request, Response } from 'express';
import { AccessToken } from 'express-openid-connect';
import slug from 'slugme';
import UID from 'uid-safe';

import { DevelopmentRoutes, PREDEFINED_REDIRECT_URLS } from './bff-routes';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
  sendBadRequest,
  sendUnauthorized,
  type RecordStr2,
} from './route-helpers';
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
import {
  AuthProfile,
  MaSession,
  type AuthenticatedRequest,
} from '../auth/auth-types';
import { ONE_SECOND_MS } from '../config/app';
import { getFromEnv } from '../helpers/env';
import { countLoggedInVisit } from '../services/visitors';

export const authRouterDevelopment = createBFFRouter({ id: 'router-dev' });

export async function createOIDCStub(
  req: Request,
  authProfile: AuthProfile,
  expiresInSeconds: number = OIDC_SESSION_MAX_AGE_SECONDS
) {
  const idAttr = TOKEN_ID_ATTRIBUTE[authProfile.authMethod];

  // 15 minutes In seconds
  const expiresAt = Date.now() + expiresInSeconds * ONE_SECOND_MS;

  const maSession: MaSession = {
    ...authProfile,
    TMASessionID: 'xx-tma-sid-xx',
    id_token: '',
    access_token: '',
    refresh_token: '',
    token_type: '',
    expires_at: '',
  };

  (req as any)[OIDC_SESSION_COOKIE_NAME] = maSession;

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
    accessToken: {
      access_token: await signDevelopmentToken(
        authProfile.authMethod,
        authProfile.id,
        'xx-tma-sid-xx'
      ),
      get expires_in() {
        return differenceInSeconds(new Date(expiresAt), new Date());
      },
      isExpired() {
        return this.expires_in <= 0;
      },
    } as AccessToken,
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

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_LOGIN,
  async (
    req: Request<{ authMethod: AuthMethod; user: string }>,
    res: Response
  ) => {
    const authMethod = req.params.authMethod;
    const testAccounts =
      authMethod === 'digid' ? testAccountsDigid : testAccountsEherkenning;

    if (!testAccounts) {
      return sendBadRequest(
        res,
        'Test accounts not available. Check env settings.'
      );
    }

    const testAccounts_ = Object.values(testAccounts).map((testAccount) => {
      const username = testAccount.username.trim().replace('Provincie-', '');
      const username_ = slug(username);

      const authLoginRoute = generateFullApiUrlBFF(
        `${authMethod === 'digid' ? authRoutes.AUTH_LOGIN_DIGID : authRoutes.AUTH_LOGIN_EHERKENNING}/${username_}`,
        [req.query as RecordStr2]
      );

      if (!testAccount.bsn) {
        throw new Error(`No id found for test account ${testAccount.username}`);
      }

      return {
        ...testAccount,
        authLoginRoute,
        username: username_,
        profileId: testAccount.bsn,
        mokum:
          testAccount.mokum || testAccount.username.startsWith('Provincie')
            ? 'Nee'
            : 'Ja',
        hasDigid: testAccount.hasDigid ? 'Ja' : 'Nee',
      };
    });

    const user =
      (req.params.user
        ? testAccounts_.find((u) => u.username === req.params.user)
        : null) ?? testAccounts_[0];

    if (!req.params.user && testAccounts_.length > 1) {
      const renderProps = {
        title: `Selecteer ${authMethod} test account.`,
        testAccounts: testAccounts_,
        idLabel: authMethod === 'digid' ? 'Bsn' : 'KvK',
      };

      return res.render('select-test-account', renderProps);
    }

    const userId = user.bsn;

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

    const appSessionCookieOptions: CookieOptions = {
      expires: new Date(
        new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS
      ),
      httpOnly: true,
      path: '/',
      secure: false, // Not secure for local development
      sameSite: 'lax',
    };

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    const isValidRedirectOption = PREDEFINED_REDIRECT_URLS.includes(
      String(req.query.redirectUrl) as (typeof PREDEFINED_REDIRECT_URLS)[number]
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
      path: '/',
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
            expiresAtMilliseconds: auth.expiresAtMilliseconds,
          })
        );
      }
    }

    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

authRouterDevelopment.get(
  authRoutes.AUTH_TOKEN_DATA,
  async (req: AuthenticatedRequest, res: Response) => {
    if (hasSessionCookie(req)) {
      const auth = getAuth(req);
      if (auth) {
        return res.send(
          apiSuccessResult({
            tokenData: req[OIDC_SESSION_COOKIE_NAME],
            token: auth.token,
            profile: auth.profile,
          })
        );
      }
    }

    return sendUnauthorized(res);
  }
);

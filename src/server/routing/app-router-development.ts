import { promisify } from 'node:util';

import type { CookieOptions, Request, Response } from 'express';
import UID from 'uid-safe';

import { DevelopmentRoutes, PREDEFINED_REDIRECT_URLS } from './bff-routes.ts';
import {
  ensureOIDCAuthContextStub,
  createDevelopmentSession,
} from './route-helpers-oidc.ts';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
  generateMaFrontendUrl,
  sendUnauthorized,
  type RequestWithRouteAndQueryParams,
} from './route-helpers.ts';
import { apiSuccessResult } from '../../universal/helpers/api.ts';
import { getReturnToUrl } from '../auth/auth-after-redirect-returnto.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  oidcSessionStore,
} from '../auth/auth-config.ts';
import { getAuth, hasSessionCookie } from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import type { AuthProfile } from '../auth/auth-types.ts';
import { type AuthenticatedRequest } from '../auth/auth-types.ts';
import { MA_FRONTEND_URL, ONE_SECOND_MS } from '../config/app.ts';
import { getFromEnv, getValueFromEnvByKey } from '../helpers/env.ts';
import {
  type TestUserAccount,
  type TestUserData,
  fetchTestAccountOverviewFile,
  getTestAccountsBaseFromEnv,
  mergeWithDynamicTableHeaders,
} from '../helpers/test-accounts.ts';
import { countLoggedInVisit } from '../services/admin/admin-visitors.ts';

export const authRouterDevelopment = createBFFRouter({ id: 'router-dev' });

function getPredefinedRedirectUrl<
  T extends (typeof PREDEFINED_REDIRECT_URLS)[number],
>(req: Request): T | null {
  const redirectUrl = String(req.query.redirectUrl) as T;
  return PREDEFINED_REDIRECT_URLS.includes(redirectUrl) ? redirectUrl : null;
}

authRouterDevelopment.use(async (req, res, next) => {
  if (hasSessionCookie(req)) {
    try {
      await ensureOIDCAuthContextStub(req);
    } catch (_error) {
      res.clearCookie(OIDC_SESSION_COOKIE_NAME);
      return sendUnauthorized(res);
    }
  }
  next();
});

authRouterDevelopment.get(
  DevelopmentRoutes.TEST_ACCOUNTS,
  async (
    req: Request<{ authMethod: AuthProfile['authMethod'] }>,
    res: Response
  ) => {
    const authMethod = req.params.authMethod;
    const envKey =
      authMethod === 'digid' ? 'MA_TEST_ACCOUNTS' : 'MA_TEST_ACCOUNTS_EH';
    const accounts = getFromEnv(envKey, true, true)!;

    res.send(accounts);
  }
);

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_LOGIN,
  async (
    req: RequestWithRouteAndQueryParams<
      { authMethod: AuthProfile['authMethod'] },
      {
        username: string;
        redirectUrl?: string;
        returnTo?: string;
      }
    >,
    res: Response
  ) => {
    const authMethod = req.params.authMethod;
    const envKey =
      authMethod === 'digid' ? 'MA_TEST_ACCOUNTS' : 'MA_TEST_ACCOUNTS_EH';

    if (!req.query.username) {
      return sendRenderedTestAccountTable(
        res,
        authMethod,
        req.query as Record<string, string | undefined>
      );
    }

    const profileId = getValueFromEnvByKey(envKey, req.query.username);

    if (!profileId) {
      return res
        .status(404)
        .send(`No test account found for username: ${req.query.username}`);
    }

    countLoggedInVisit(profileId, authMethod);

    const SESSION_ID_BYTE_LENGTH = 18;
    const sessionID = UID.sync(SESSION_ID_BYTE_LENGTH);
    const authProfile: AuthProfile = {
      id: profileId,
      authMethod,
      profileType: authMethod === 'digid' ? 'private' : 'commercial',
      sid: sessionID,
    };

    const appSessionCookieValue = await createDevelopmentSession(
      req,
      authProfile
    );

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

    const redirectUrl = getPredefinedRedirectUrl(req);

    // This used for applications that use the dev router for obtaining a session cookie, but don't want to be redirected to the frontend.
    if (redirectUrl === 'noredirect') {
      return res.send('ok');
    }

    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    if (req.query.returnTo) {
      return res.redirect(getReturnToUrl(req.query));
    }

    return res.redirect(
      generateMaFrontendUrl(`/?authMethod=${req.params.authMethod}`)
    );
  }
);

function transformAccount(account: TestUserAccount): TestUserAccount {
  if (account.brpBsn === account.profileId) {
    account.brpBsn = '';
  }

  return account;
}

async function sendRenderedTestAccountTable(
  res: Response,
  authMethod: AuthMethod,
  loginQueryParams: Record<string, string | undefined> = {}
) {
  const envKey =
    authMethod === 'digid' ? 'MA_TEST_ACCOUNTS' : 'MA_TEST_ACCOUNTS_EH';

  const testAccountsBase = getTestAccountsBaseFromEnv(envKey);
  let testAccountsOverview: TestUserData | null = null;
  try {
    testAccountsOverview = await fetchTestAccountOverviewFile(
      `${envKey}_OVERVIEW_URL`
    );
  } catch (error) {
    console.error(
      'Error fetching test account overview file:',
      (error as Error).toString()
    );
  }

  const testAccountOverviewByUsername =
    testAccountsOverview?.accounts.reduce(
      (acc, account) => {
        acc[account.username] = account;
        return acc;
      },
      {} as Record<string, TestUserAccount>
    ) ?? {};

  const testAccountsBaseByUsername = testAccountsBase.accounts.reduce(
    (acc, account) => {
      acc[account.username] = account;
      return acc;
    },
    {} as Record<string, TestUserAccount>
  );

  const accounts_ = [
    // First enrich the base accounts with the overview data.
    ...testAccountsBase.accounts.map((account) => {
      const overviewAccount =
        testAccountOverviewByUsername[account.username] ?? {};
      return {
        ...overviewAccount,
        ...account,
      };
    }),
    // Then add any additional accounts from the overview that are not in the base.
    ...(testAccountsOverview?.accounts || []).filter(
      (account) => !(account.username in testAccountsBaseByUsername)
    ),
  ].map((account) => transformAccount(account));

  const tableHeaders_ = [
    ...testAccountsBase.tableHeaders,
    ...(testAccountsOverview?.tableHeaders || []).filter(
      (header) =>
        !testAccountsBase.tableHeaders.some(
          (baseHeader) => baseHeader.key === header.key
        )
    ),
  ];

  const testAccountsData: TestUserData = {
    tableHeaders: mergeWithDynamicTableHeaders({
      tableHeaders: tableHeaders_,
      accounts: accounts_,
    }),
    accounts: accounts_,
  };

  const accountsWithLoginLink = addLoginLinkToUsernameProp(
    testAccountsData,
    authMethod,
    loginQueryParams
  );

  const renderProps = {
    title: 'Selecteer een testaccount',
    tableHeaders: testAccountsData.tableHeaders,
    tableRows: accountsWithLoginLink,
  };

  return res.render('select-test-account', renderProps);
}

function filterUndefinedQueryParams(
  queryParams: Record<string, string | undefined>
) {
  return Object.fromEntries(
    Object.entries(queryParams).filter(([, value]) => typeof value === 'string')
  );
}

function addLoginLinkToUsernameProp(
  testAccountData: TestUserData,
  authMethod: AuthProfile['authMethod'],
  loginQueryParams: Record<string, string | undefined>
) {
  const authRoute = `${authMethod === 'digid' ? authRoutes.AUTH_LOGIN_DIGID : authRoutes.AUTH_LOGIN_EHERKENNING}`;
  return testAccountData.accounts.map((account) => {
    const queryParams = {
      ...filterUndefinedQueryParams(loginQueryParams),
      username: account.username,
    };

    const authLoginRoute = generateFullApiUrlBFF(authRoute, [queryParams]);
    return {
      ...account,
      username: `<a href="${authLoginRoute}" class="test-account-name">${account.username.replace(/^[a-zA-Z]_/, '')}</a>`,
    };
  });
}

authRouterDevelopment.get(
  [
    authRoutes.AUTH_LOGOUT,
    authRoutes.AUTH_LOGOUT_EHERKENNING,
    authRoutes.AUTH_LOGOUT_DIGID,
  ],
  async (req, res) => {
    const sessionToken = req.cookies?.[OIDC_SESSION_COOKIE_NAME];
    if (sessionToken) {
      await promisify(oidcSessionStore.destroy.bind(oidcSessionStore))(
        sessionToken
      );
    }
    res.clearCookie(OIDC_SESSION_COOKIE_NAME, {
      path: '/',
    });
    const returnTo = getReturnToUrl(req.query, MA_FRONTEND_URL);
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

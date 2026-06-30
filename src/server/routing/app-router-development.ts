import { differenceInSeconds } from 'date-fns';
import type { CookieOptions, Request, Response } from 'express';
import type { AccessToken } from 'express-openid-connect';
import UID from 'uid-safe';

import { DevelopmentRoutes, PREDEFINED_REDIRECT_URLS } from './bff-routes.ts';
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
  TOKEN_ID_ATTRIBUTE,
} from '../auth/auth-config.ts';
import { signDevelopmentToken } from '../auth/auth-helpers-development.ts';
import { getAuth, hasSessionCookie } from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import type { AuthProfile, MaSession } from '../auth/auth-types.ts';
import { type AuthenticatedRequest } from '../auth/auth-types.ts';
import { MA_FRONTEND_URL, ONE_SECOND_MS } from '../config/app.ts';
import { getFromEnv, getValueFromEnvByKey } from '../helpers/env.ts';
import {
  type TestUserData,
  fetchTestAccountOverviewFile,
  getTestAccountsBaseFromEnv,
  mergeWithDynamicTableHeaders,
} from '../helpers/test-accounts.ts';
import { countLoggedInVisit } from '../services/admin/admin-visitors.ts';

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
      return sendRenderedTestAccountTable(res, authMethod);
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

    await createOIDCStub(req, authProfile);

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

    // This used for applications that use the dev router for obtaining a session cookie, but don't want to be redirected to the frontend.
    if (isValidRedirectOption && req.query.redirectUrl === 'noredirect') {
      return res.send('ok');
    }

    const redirectUrl =
      req.query.redirectUrl && isValidRedirectOption
        ? String(req.query.redirectUrl)
        : req.query.returnTo
          ? getReturnToUrl(req.query)
          : generateMaFrontendUrl(`/?authMethod=${req.params.authMethod}`);

    return res.redirect(redirectUrl);
  }
);

async function sendRenderedTestAccountTable(
  res: Response,
  authMethod: AuthMethod
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

  const accounts_ = [
    ...testAccountsBase.accounts,
    ...(testAccountsOverview?.accounts || []).filter(
      (account) =>
        !testAccountsBase.accounts.some(
          (baseAccount) => baseAccount.username === account.username
        )
    ),
  ];
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
    authMethod
  );
  const [tableHeaders, tableRows] = formatForTable({
    ...testAccountsData,
    accounts: accountsWithLoginLink,
  });
  const renderProps = {
    title: 'Selecteer een testaccount',
    tableHeaders,
    tableRows,
  };

  return res.render('select-test-account', renderProps);
}

function addLoginLinkToUsernameProp(
  testAccountData: TestUserData,
  authMethod: AuthProfile['authMethod']
) {
  const authRoute = `${authMethod === 'digid' ? authRoutes.AUTH_LOGIN_DIGID : authRoutes.AUTH_LOGIN_EHERKENNING}`;

  return testAccountData.accounts.map((account) => {
    const authLoginRoute = generateFullApiUrlBFF(authRoute, [
      { username: account.username },
    ]);
    return {
      ...account,
      username: `<a href="${authLoginRoute}" class="test-account-name">${account.username}</a>`,
    };
  });
}

type TableHeaders = string[];
type TableRows = string[][];

function formatForTable(accountData: TestUserData): [TableHeaders, TableRows] {
  const tableHeaders = accountData.tableHeaders.map((h) => h.displayName);

  accountData = checkUpdateKeys(accountData);

  if (accountData.accounts.length <= 0) {
    return [tableHeaders, []];
  }

  // This is gonna be a table, so all keys need to be in the same order.
  const keyOrder: Record<string, number> = {};
  accountData.tableHeaders.forEach((th, i) => (keyOrder[th.key] = i));

  const tableRows = accountData.accounts.map((account) => {
    const sortedEntries = Object.entries(account).toSorted(([keyA], [keyB]) => {
      return keyOrder[keyA] < keyOrder[keyB] ? -1 : 1;
    });

    const fields = sortedEntries.map(([_, v]) => {
      if (typeof v === 'boolean') {
        return v ? 'Ja' : 'Nee';
      }
      return v;
    });
    return fields;
  });

  return [tableHeaders, tableRows];
}

function checkUpdateKeys(accountData: TestUserData): TestUserData {
  accountData.accounts.forEach((account) => {
    if (!account.profileId) {
      throw new Error(`No id found for test account ${account.username}`);
    }
    accountData.tableHeaders.forEach(({ key }) => {
      if (!Object.keys(account).includes(key)) {
        account[key] = 'Unknown';
      }
    });
  });
  return accountData;
}

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

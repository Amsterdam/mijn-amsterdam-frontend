import { differenceInSeconds } from 'date-fns';
import type { CookieOptions, Request, Response } from 'express';
import type { AccessToken } from 'express-openid-connect';
import slug from 'slugme';
import UID from 'uid-safe';

import { DevelopmentRoutes, PREDEFINED_REDIRECT_URLS } from './bff-routes.ts';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
  generateMaFrontendUrl,
  sendBadRequest,
  sendUnauthorized,
} from './route-helpers.ts';
import { apiSuccessResult } from '../../universal/helpers/api.ts';
import { getReturnToUrl } from '../auth/auth-after-redirect-returnto.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  TOKEN_ID_ATTRIBUTE,
} from '../auth/auth-config.ts';
import {
  getBackupTestaccounts,
  getTestAccountData,
  getTestAccounts,
} from '../auth/auth-development.ts';
import type { TestUserData } from '../auth/auth-development.ts';
import {
  cleanTestUsername,
  signDevelopmentToken,
} from '../auth/auth-helpers-development.ts';
import { getAuth, hasSessionCookie } from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import type { AuthProfile, MaSession } from '../auth/auth-types.ts';
import { type AuthenticatedRequest } from '../auth/auth-types.ts';
import { MA_FRONTEND_URL, ONE_SECOND_MS } from '../config/app.ts';
import { getFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';
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

    let envKey = 'MA_TEST_ACCOUNTS';
    if (authMethod === 'eherkenning') {
      envKey = 'MA_TEST_ACCOUNTS_EH';
    }

    const accounts = getFromEnv(envKey, true, true)!;
    res.send(accounts);
  }
);

authRouterDevelopment.get(
  DevelopmentRoutes.DEV_LOGIN,
  async (
    req: Request<{ authMethod: AuthMethod; user: string }>,
    res: Response
  ) => {
    const authMethod = req.params.authMethod;

    const testAccounts =
      authMethod === 'digid'
        ? getTestAccounts('MA_TEST_ACCOUNTS')
        : getTestAccounts('MA_TEST_ACCOUNTS_EH');

    if (!req.params.user) {
      return sendRenderedTestAccountTable(req, res, authMethod);
    }

    let profileId = testAccounts['ma-dev-profile'];

    const foundProfileId = testAccounts[req.params.user];
    if (foundProfileId) {
      profileId = foundProfileId;
    } else {
      logger.error(
        `user '${req.params.user}' not found, defaulting to user with profileId: '${profileId}'`
      );
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
          : generateMaFrontendUrl(`/?authMethod=${req.params.authMethod}`);

    return res.redirect(redirectUrl);
  }
);

async function sendRenderedTestAccountTable(
  req: Request,
  res: Response,
  authMethod: AuthMethod
) {
  const envKey =
    authMethod === 'digid' ? 'MA_TEST_ACCOUNTS' : 'MA_TEST_ACCOUNTS_EH';
  const testAccountData = await getTestAccountData(envKey);

  if (!testAccountData) {
    return sendBadRequest(
      res,
      'Test account data not available. Check storage account or test-account files.'
    );
  }

  let tableHeaders;
  let tableRows;
  try {
    const testAccounts = transformUsernames(req, testAccountData, authMethod);
    [tableHeaders, tableRows] = formatForTable({
      ...testAccountData,
      accounts: testAccounts,
    } as TestUserData);
  } catch (err) {
    logger.error(err);
    const backupAccounts = getBackupTestaccounts(envKey);
    const testAccounts = transformUsernames(req, backupAccounts, authMethod);
    [tableHeaders, tableRows] = formatForTable({
      ...backupAccounts,
      accounts: testAccounts,
    } as TestUserData);
  }
  const renderProps = {
    title: `Selecteer ${authMethod} test account.`,
    tableHeaders,
    tableRows,
  };

  return res.render('select-test-account', renderProps);
}

function transformUsernames(
  req: Request,
  testAccountData: TestUserData,
  authMethod: AuthProfile['authMethod']
) {
  let testAccounts = testAccountData.accounts.map((account) => {
    let username = cleanTestUsername(account.username);
    username = slug(username);
    return { ...account, username };
  });
  const authRoute = `${authMethod === 'digid' ? authRoutes.AUTH_LOGIN_DIGID : authRoutes.AUTH_LOGIN_EHERKENNING}`;

  testAccounts = testAccounts.map((account) => {
    const authLoginRoute = generateFullApiUrlBFF(
      `${authRoute}/${account.username}`,
      [req.query as Record<string, string>]
    );
    const href = `<a href="${authLoginRoute}">
                      <div class="test-account-name">${account.username}</div>
                    </a>`;
    return { ...account, username: href };
  });

  return testAccounts;
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

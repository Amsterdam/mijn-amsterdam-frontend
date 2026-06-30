import type { AccessToken } from 'express-openid-connect';
import * as jose from 'jose';
import memoizee from 'memoizee';

import {
  OIDC_TOKEN_AUD_ATTRIBUTE_VALUE,
  TOKEN_ID_ATTRIBUTE,
} from './auth-config.ts';
import type { AuthProfile } from './auth-types.ts';
import { capitalizeFirstLetter } from '../../universal/helpers/text.ts';
import { uniqueArray } from '../../universal/helpers/utils.ts';
import { DEV_JWK_PRIVATE } from '../config/development.ts';
import { getFromEnv, getValueMapFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';

/**
 *
 * Helpers for development
 */

export async function getPrivateKeyForDevelopment() {
  return jose.importJWK(DEV_JWK_PRIVATE);
}

async function signDevelopmentToken_(
  authMethod: AuthProfile['authMethod'],
  userID: string,
  sessionID: SessionID
): Promise<AccessToken['access_token'] | undefined> {
  const data = {
    [TOKEN_ID_ATTRIBUTE[authMethod]]: userID,
    aud: OIDC_TOKEN_AUD_ATTRIBUTE_VALUE[authMethod],
    sid: sessionID,
  };
  const alg = 'RS256';
  try {
    const accessToken = await new jose.SignJWT(data)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(await getPrivateKeyForDevelopment());
    return accessToken;
  } catch (err) {
    logger.error(err);
  }
}

export const signDevelopmentToken = memoizee(signDevelopmentToken_);

export type TestUserData = {
  tableHeaders: TableHeader[];
  accounts: TestUserAccount[];
};
type TableHeader = {
  displayName: string;
  // Maps to a property of TestUserAccount, e.q. key: 'foo'; { ->  foo: 'data' }.
  key: string;
};

export type TestUserAccount = {
  username: string;
  profileId: string;
} & OptionalTestUserAccountProperties;

export type OptionalTestUserAccountProperties = Record<
  string,
  string | boolean
>;

export type TestUsers = Record<string, AuthProfile['id']>;
type TestAccountEnvKey = 'MA_TEST_ACCOUNTS' | 'MA_TEST_ACCOUNTS_EH';

export async function fetchTestAccountOverviewFile(
  envKey: `${TestAccountEnvKey}_OVERVIEW_URL`
): Promise<TestUserData> {
  let url = getFromEnv(envKey, true, true);

  if (!url) {
    throw new Error(`${envKey} is not set in the environment variables.`);
  }

  try {
    url = new URL(url).toString();
  } catch (error) {
    throw new Error(`${envKey} is not a valid URL: ${url}. Error: ${error}`);
  }

  return fetch(url).then((res) => res.json());
}

export function getTestAccountsBaseFromEnv(
  envKey: TestAccountEnvKey
): TestUserData {
  const envMap = getValueMapFromEnv(envKey);
  const profileType = envKey === 'MA_TEST_ACCOUNTS' ? 'private' : 'commercial';
  return getTestAccountsBaseFromEnvMap(envMap, profileType);
}

export function getTestAccountsBaseFromEnvMap(
  envMap: Map<string, string>,
  profileType: AuthProfile['profileType']
): TestUserData {
  const testAccountsFromEnv = Array.from(envMap.entries());

  const accounts = testAccountsFromEnv.map(([username, profileId]) => {
    return {
      username,
      profileId,
    };
  });

  return {
    tableHeaders: [
      { displayName: 'Gebruikersnaam', key: 'username' },
      {
        displayName: profileType === 'private' ? 'BSN' : 'KVK',
        key: 'profileId',
      },
    ],
    accounts,
  };
}

export function mergeWithDynamicTableHeaders(
  accountData: TestUserData
): TestUserData['tableHeaders'] {
  const tableHeaders = accountData.tableHeaders;
  const accounts = accountData.accounts;

  // Dynamically add any extra properties that are present in the accounts to the tableHeaders.
  tableHeaders.push(
    // Get all the properties
    ...uniqueArray(accounts.flatMap((account) => Object.keys(account)))
      // Filter out any properties that are already in the tableHeaders
      .filter((key) => !tableHeaders.some((header) => header.key === key))
      .map((key) => ({
        key,
        displayName: capitalizeFirstLetter(key),
      }))
  );

  return tableHeaders;
}

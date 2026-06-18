import { readFileSync } from 'fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import slug from 'slugme';

import type { AuthProfile } from './auth-types.ts';
import { IS_PRODUCTION } from '../../universal/config/env.ts';
import { downloadBlob, getBlobStorage } from '../config/azure-storage.ts';
import { getFromEnv } from '../helpers/env.ts';
import { logger } from '../logging.ts';

const dirOfThisFile = dirname(fileURLToPath(import.meta.url));

export const DIGID_TEST_ACCOUNTS_PATH = join(
  dirOfThisFile,
  './generated/digid-test-accounts.json'
);
export const EHERKENNING_TEST_ACCOUNTS_PATH = join(
  dirOfThisFile,
  './generated/eherkenning-test-accounts.json'
);

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

type LowercaseName = string;
type TestUsers = Record<LowercaseName, AuthProfile['id']>;

export function getTestAccounts(
  envKey: 'MA_TEST_ACCOUNTS' | 'MA_TEST_ACCOUNTS_EH'
): TestUsers {
  const accounts = getFromEnv(envKey, true, true)!;

  const users: TestUsers = {};

  accounts.split(',').forEach((account) => {
    const [username, profileId] = account.split(':');
    users[slug(username)] = profileId;
  });

  return users;
}

export async function getTestAccountData(
  envKey: 'MA_TEST_ACCOUNTS' | 'MA_TEST_ACCOUNTS_EH'
): Promise<TestUserData | null> {
  if (IS_PRODUCTION) {
    logger.warn(
      'No accounts will be returned. Using test accounts in production is not allowed.'
    );
    return null;
  }

  const client = getBlobStorage();
  if (!client) {
    logger.info('No client found, returning test accounts from file');
    const testAccountPath =
      envKey === 'MA_TEST_ACCOUNTS'
        ? DIGID_TEST_ACCOUNTS_PATH
        : EHERKENNING_TEST_ACCOUNTS_PATH;
    const jsonString = readFileSync(testAccountPath).toString();
    return JSON.parse(jsonString);
  }

  const containerClient = client.getContainerClient('test-accounts');

  const fileName =
    envKey === 'MA_TEST_ACCOUNTS'
      ? 'digid-test-accounts.json'
      : 'eherkenning-test-accounts.json';

  return JSON.parse(await downloadBlob(containerClient, fileName));
}

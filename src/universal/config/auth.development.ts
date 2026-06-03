import { readFileSync } from 'fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { IS_PRODUCTION } from './env.ts';
import { getFromEnv } from '../../server/helpers/env.ts';

export const testAccountDataDigid = getTestAccountData('MA_TEST_ACCOUNTS');
export const testAccountDataEherkenning = getTestAccountData(
  'MA_TEST_ACCOUNTS_EH'
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

function getTestAccountData(
  envKey: 'MA_TEST_ACCOUNTS' | 'MA_TEST_ACCOUNTS_EH'
): TestUserData | null {
  if (IS_PRODUCTION) {
    return null;
  }
  const envValue = getFromEnv(envKey, false);
  if (envValue) {
    return JSON.parse(envValue);
  }
  const dirOfThisFile = dirname(fileURLToPath(import.meta.url));
  const testAccountPath =
    envKey === 'MA_TEST_ACCOUNTS'
      ? join(dirOfThisFile, './digid-test-accounts.json')
      : join(dirOfThisFile, './eherkenning-test-accounts.json');
  const jsonString = readFileSync(testAccountPath).toString();

  return JSON.parse(jsonString);
}

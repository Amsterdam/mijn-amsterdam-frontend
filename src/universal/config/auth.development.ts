import { IS_PRODUCTION } from './env.ts';
import { getFromEnv } from '../../server/helpers/env.ts';
import { readFileSync } from 'fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const testAccountDataDigid = getTestAccountData('MA_TEST_ACCOUNTS');
export const testAccountDataEherkenning = getTestAccountData(
  'MA_TEST_ACCOUNTS_EH'
);

export type TestUserData = {
  tableHeaders: TableHeader[];
  accounts: TestUserAccount[];
};

/** An object describing the name of the table header and the key it is mapped to -
 * inside of TestUserAccount.
 */
type TableHeader = {
  displayName: string;
  key: string;
};

/** Fields of the table data, the optional fields are not only used for -
 * informational purposes. */
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

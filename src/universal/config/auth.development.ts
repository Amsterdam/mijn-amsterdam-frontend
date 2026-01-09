import { IS_PRODUCTION } from './env';
import { getFromEnv } from '../../server/helpers/env';

export const DEV_USER_ID_DEFAULT =
  getFromEnv('MA_PROFILE_DEV_ID', false) || 'I.M Mokum';

const FALLBACK_DEV_ACCOUNT: TestUserAccount = {
  username: 'dev',
  profileId: DEV_USER_ID_DEFAULT,
  mokum: false,
  hasDigid: true,
  description: 'Fallback test account',
};

const FALLBACK_TEST_USER_DATA: TestUserData = {
  tableHeaders: [
    {
      displayName: 'Gebruikersnaam',
      key: 'username',
    },
    {
      displayName: 'BSN',
      key: 'profileId',
    },
    {
      displayName: 'Mokum',
      key: 'mokum',
    },
    {
      displayName: 'Digid',
      key: 'hasDigid',
    },
    {
      displayName: 'Beschrijving',
      key: 'description',
    },
  ],
  accounts: [FALLBACK_DEV_ACCOUNT],
};

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

/** Fields of the table data, the explicit fields are not only used for -
 * informational purposes. */
export type TestUserAccount = {
  username: string;
  profileId: string;
} & Record<string, string | boolean>;

function getTestAccountData(envKey: string): TestUserData | null {
  if (IS_PRODUCTION) {
    return null;
  }
  const accounts =
    getFromEnv(envKey, false) || JSON.stringify(FALLBACK_TEST_USER_DATA);
  const testUserData: TestUserData = JSON.parse(accounts);
  return testUserData;
}

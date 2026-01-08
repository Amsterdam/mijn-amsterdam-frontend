import { IS_PRODUCTION } from './env';
import { getFromEnv } from '../../server/helpers/env';

export const DEV_USER_ID_DEFAULT =
  getFromEnv('MA_PROFILE_DEV_ID', false) || 'I.M Mokum';

const FALLBACK_DEV_ACCOUNT = `{"username":"dev","bsn":"${DEV_USER_ID_DEFAULT}","mokum":false,"hasDigid":true,"description":"Atestdescription."}`;

export const testAccountDataDigid = getTestAccountData('MA_TEST_ACCOUNTS');
export const testAccountDataEherkenning = getTestAccountData(
  'MA_TEST_ACCOUNTS_EH'
);

export type TestUserData = {
  tableHeaders: TableHeaders;
  accounts: TestUserAccount[];
};

type TableHeaders = string[];

export type TestUserAccount = {
  username: string;
  bsn: string;
  mokum: boolean;
  hasDigid: boolean;
  description: string;
};

function getTestAccountData(envKey: string): TestUserData | null {
  if (IS_PRODUCTION) {
    return null;
  }
  const accounts = getFromEnv(envKey, false) || FALLBACK_DEV_ACCOUNT;
  const testUserData: TestUserData = JSON.parse(accounts);
  return testUserData;
}

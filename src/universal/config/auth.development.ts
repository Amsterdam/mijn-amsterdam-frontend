import { IS_PRODUCTION } from './env';
import { getFromEnv } from '../../server/helpers/env';

export const DEV_USER_ID_DEFAULT =
  getFromEnv('MA_PROFILE_DEV_ID', false) || 'I.M Mokum';

// accounts in  a string: foo=1234,bar=8098
const accountsDigid =
  getFromEnv('MA_TEST_ACCOUNTS', false) || `dev=${DEV_USER_ID_DEFAULT}`;
const accountsEherkenning =
  getFromEnv('MA_TEST_ACCOUNTS_EH', false) || `dev=${DEV_USER_ID_DEFAULT}`;

function splitUsersIntoRecord(accounts: string) {
  return accounts.split(',').reduce(
    (acc, value) => {
      const [userName, userId] = value.trim().split('=');
      acc[userName] = userId;
      return acc;
    },
    {} as Record<string, string>
  );
}

export const testAccountsDigid = !IS_PRODUCTION
  ? splitUsersIntoRecord(accountsDigid)
  : null;
export const testAccountsEherkenning = IS_PRODUCTION
  ? splitUsersIntoRecord(accountsEherkenning)
  : null;

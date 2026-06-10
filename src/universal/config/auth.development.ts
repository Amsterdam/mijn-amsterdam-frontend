import { IS_PRODUCTION } from './env.ts';
import {
  blobServiceClient,
  downloadBlob,
} from '../../server/config/azure-storage.ts';

export const testAccountDataDigid =
  await getTestAccountData('MA_TEST_ACCOUNTS');
export const testAccountDataEherkenning = await getTestAccountData(
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

async function getTestAccountData(
  envKey: 'MA_TEST_ACCOUNTS' | 'MA_TEST_ACCOUNTS_EH'
): Promise<TestUserData | null> {
  if (IS_PRODUCTION) {
    return null;
  }

  const containerClient =
    blobServiceClient().getContainerClient('test-accounts');

  const fileName =
    envKey === 'MA_TEST_ACCOUNTS'
      ? 'digid-test-accounts.json'
      : 'eherkenning-test-accounts.json';

  return JSON.parse(await downloadBlob(containerClient, fileName));
}

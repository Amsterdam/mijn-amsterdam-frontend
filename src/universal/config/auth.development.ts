export const DEV_USER_ID_DEFAULT =
  (typeof MA_PROFILE_DEV_ID !== 'undefined'
    ? MA_PROFILE_DEV_ID
    : process.env.MA_PROFILE_DEV_ID) ?? 'I.M Mokum';

// accounts in  a string: foo=1234,bar=8098
const accounts =
  (typeof MA_TEST_ACCOUNTS !== 'undefined'
    ? MA_TEST_ACCOUNTS
    : process.env.MA_TEST_ACCOUNTS) || `dev=${DEV_USER_ID_DEFAULT}`;

export const testAccounts = accounts.split(',').reduce(
  (acc, value) => {
    const [userName, userId] = value.trim().split('=');
    acc[userName] = userId;
    return acc;
  },
  {} as Record<string, string>
);

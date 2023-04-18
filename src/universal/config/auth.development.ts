export const DEV_USER_ID_DEFAULT =
  process.env.BFF_PROFILE_DEV_ID ?? 'I.M Mokum';
// accounts in  a string: foo=1234,bar=8098
export const testAccounts = (
  process.env.REACT_APP_TEST_ACCOUNTS || `dev=${DEV_USER_ID_DEFAULT}`
)
  .split(',')
  .reduce((acc, value) => {
    const [userName, userId] = value.trim().split('=');
    acc[userName] = userId;
    return acc;
  }, {} as Record<string, string>);

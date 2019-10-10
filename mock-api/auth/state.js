const storage = require('node-persist');
const differenceInSeconds = require('date-fns').differenceInSeconds;

const TIMEOUT_MINUTES = 15;
const ONE_MINUTE_IN_SECONDS = 60;
const DIGID_SESSION_TIMEOUT_SECONDS = TIMEOUT_MINUTES * ONE_MINUTE_IN_SECONDS;

storage.init();

exports.isAuthenticated = async () => {
  const isAuthenticated = await storage.getItem('authState');
  const lastLogin = await storage.getItem('authStateLastLogin');
  const isValidSessionTime =
    differenceInSeconds(new Date(), new Date(lastLogin)) <
    DIGID_SESSION_TIMEOUT_SECONDS;
  return isAuthenticated && isValidSessionTime;
};
exports.getUserType = () => storage.getItem('userType');

exports.setAuth = isAuthenticated => {
  return Promise.all([
    storage.setItem('authState', isAuthenticated),
    isAuthenticated
      ? storage.setItem('authStateLastLogin', new Date().toISOString())
      : null,
  ]);
};

exports.setUserType = type => {
  return storage.setItem('userType', type);
};

exports.DIGID_SESSION_TIMEOUT_SECONDS = DIGID_SESSION_TIMEOUT_SECONDS;

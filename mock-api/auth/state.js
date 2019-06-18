const storage = require('node-persist');
const differenceInSeconds = require('date-fns/difference_in_seconds');

const DIGID_SESSION_TIMEOUT_SECONDS = 10;

storage.init();

exports.isAuthenticated = async () => {
  const isAuthenticated = await storage.getItem('authState');
  const lastLogin = await storage.getItem('authStateLastLogin');
  const isValidSessionTime =
    differenceInSeconds(new Date(), lastLogin) < DIGID_SESSION_TIMEOUT_SECONDS;
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

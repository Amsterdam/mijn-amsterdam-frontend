const storage = require('node-persist');

const TIMEOUT_MINUTES = 15;
const ONE_MINUTE_IN_SECONDS = 60;
const DIGID_SESSION_TIMEOUT_SECONDS = TIMEOUT_MINUTES * ONE_MINUTE_IN_SECONDS;

storage.init();

exports.isAuthenticated = async () => {
  return storage.getItem('authState');
};

exports.getUserType = () => storage.getItem('userType');

exports.setAuth = isAuthenticated => {
  return storage.setItem('authState', isAuthenticated);
};

exports.setUserType = type => {
  return storage.setItem('userType', type);
};

exports.DIGID_SESSION_TIMEOUT_SECONDS = DIGID_SESSION_TIMEOUT_SECONDS;

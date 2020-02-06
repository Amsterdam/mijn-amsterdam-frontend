const storage = {
  data: {},
  setItem(key, val) {
    storage.data[key] = val;
  },
  getItem(key) {
    return storage.data[key] || null;
  },
};

const TIMEOUT_MINUTES = 15;
const ONE_MINUTE_IN_SECONDS = 60;
const DIGID_SESSION_TIMEOUT_SECONDS = TIMEOUT_MINUTES * ONE_MINUTE_IN_SECONDS;

exports.isAuthenticated = async () => {
  return storage.getItem('isAuthenticated');
};

exports.getUserType = () => storage.getItem('userType');

exports.setAuth = isAuthenticated => {
  return storage.setItem('isAuthenticated', isAuthenticated);
};

exports.setUserType = type => {
  return storage.setItem('userType', type);
};

exports.DIGID_SESSION_TIMEOUT_SECONDS = DIGID_SESSION_TIMEOUT_SECONDS;

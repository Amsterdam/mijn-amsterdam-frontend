const storage = require('node-persist');

storage.init();

exports.isAuthenticated = () => storage.getItem('authState');
exports.getUserType = () => storage.getItem('userType');

exports.setAuth = isAuthenticated => {
  return storage.setItem('authState', isAuthenticated);
};

exports.setUserType = type => {
  return storage.setItem('userType', type);
};

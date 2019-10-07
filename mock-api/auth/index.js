const state = require('./state');
const ip = require('../index').ip || 'localhost';
const APP_HOST = process.env.APP_HOST || `http://${ip}`;
const APP_PORT = process.env.APP_PORT || 3000;
const APP_URL = `${APP_HOST}:${APP_PORT}`;

module.exports = {
  path: '/api/login|logout',
  cache: false,
  status: async (req, res, next) => {
    if (req.url.endsWith('login')) {
      await state.setAuth(true);
      await state.setUserType(req.params.userType || 'BURGER');
      res.redirect(APP_URL);
      return;
    } else if (req.url.endsWith('logout')) {
      await state.setUserType(null);
      await state.setAuth(false);
      res.redirect(APP_URL);
      return;
    }
    next();
  },
  template: require('./check').template,
};

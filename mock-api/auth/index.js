const state = require('./state');
const ip = require('../get-ip') || 'localhost';
const APP_HOST = process.env.APP_HOST || ip;
const APP_PORT = process.env.APP_PORT || 3000;
const port = APP_PORT !== 80 ? `:${APP_PORT}` : '';
const REDIRECT_URL = `//${APP_HOST}${port}`;

module.exports = {
  path: '/api/login|logout',
  cache: false,
  status: async (req, res, next) => {
    if (req.url.endsWith('login')) {
      await state.setAuth(true);
      await state.setUserType(req.params.userType || 'BURGER');
      res.redirect(REDIRECT_URL);
      return;
    } else if (req.url.endsWith('logout')) {
      await state.setUserType(null);
      await state.setAuth(false);
      res.redirect(REDIRECT_URL);
      return;
    }
    next();
  },
  template: require('./check').template,
};

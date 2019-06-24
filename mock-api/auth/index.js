const state = require('./state');
const server = require('../index');
const APP_PORT = process.env.FRONT_END_PORT || 3000;
const APP_URL = `http://${server.ip}:${APP_PORT}`;

module.exports = {
  path: '/api/login|logout',
  cache: false,
  status: async (req, res, next) => {
    // console.log(req.headers);
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

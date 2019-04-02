const state = require('./state');

const APP_PORT = process.env.FRONT_END_PORT || 3000;
const APP_URL = `http://localhost:${APP_PORT}`;

module.exports = {
  path: '/api/login|logout',
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
  template: {
    isAuthenticated: async (params, query, body, x, headers) => {
      return state.isAuthenticated();
    },
    userType: async (params, query, body, x, headers) => {
      return state.getUserType();
    },
  },
};

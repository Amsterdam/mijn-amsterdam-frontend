let isAuthenticated = false;
let userType = null;

const APP_PORT = process.env.FRONT_END_PORT || 3000;
const APP_URL = `http://localhost:${APP_PORT}`;

module.exports = {
  path: '/api/auth|login|logout',
  status: (req, res, next) => {
    if (req.url.endsWith('login')) {
      isAuthenticated = true;
      userType = req.params.userType || 'BURGER';
      res.redirect(APP_URL);
      return;
    } else if (req.url.endsWith('auth') && !isAuthenticated) {
      res.status(403);
    } else if (req.url.endsWith('logout')) {
      userType = null;
      isAuthenticated = false;
      res.redirect(APP_URL);
      return;
    }
    next();
  },
  template: {
    isAuthenticated: (params, query, body, x, headers) => {
      return isAuthenticated;
    },
    userType: (params, query, body, x, headers) => {
      return userType;
    },
  },
};

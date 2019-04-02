const state = require('./state');

module.exports = {
  path: '/api/auth/check',
  status: async (req, res, next) => {
    if (!(await state.isAuthenticated())) {
      res.status(403);
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

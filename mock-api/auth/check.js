const state = require('./state');

module.exports = {
  path: '/api/auth/check',
  cache: false,
  status: async (req, res, next) => {
    const isAuthenticated = await state.isAuthenticated();
    if (!isAuthenticated) {
      res.status(403);
    } else {
      // Renew session for every check
      await state.setAuth(true);
    }
    next();
  },
  template: async (params, query, body, x, headers) => {
    const isAuthenticated = await state.isAuthenticated();
    const userType = await state.getUserType();
    const response = {
      isAuthenticated,
      userType,
    };
    return response;
  },
};

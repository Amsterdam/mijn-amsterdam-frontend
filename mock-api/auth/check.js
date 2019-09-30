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
    const validUntil = new Date();

    validUntil.setSeconds(
      validUntil.getSeconds() + state.DIGID_SESSION_TIMEOUT_SECONDS
    );

    const response = {
      isAuthenticated,
      validUntil: validUntil.getTime(),
      userType,
    };
    return response;
  },
};

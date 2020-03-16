module.exports = {
  path: '/api/auth/check',
  cache: false,
  template: async (params, query, body, cookies, headers) => {
    const xSession = headers['x-session'] && JSON.parse(headers['x-session']);
    const { userType, isAuthenticated, validUntil } = xSession || {
      userType: 'BURGER',
      validUntil: -1,
      isAuthenticated: false,
    };

    const response = {
      isAuthenticated,
      validUntil,
      userType,
    };

    return response;
  },
};

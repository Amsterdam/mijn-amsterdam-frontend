module.exports = {
  path: '/api/auth',
  template: {
    isAuthenticated: (params, query, body, x, headers) => {
      return true;
      // return (
      //   'x-saml-attribute-token1' in headers ||
      //   'x-saml-attribute-token2' in headers
      // );
    },
    userType: (params, query, body, x, headers) => {
      if ('x-saml-attribute-token2' in headers) {
        return 'BEDRIJF';
      }
      return 'BURGER';
    },
  },
};

const user = require('./brp.user.json');

module.exports = {
  path: '/api/brp/brp',
  template: {
    ...user,
  },
};

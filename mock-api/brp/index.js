const user = require('./brp.user.json');

module.exports = {
  path: '/brp',
  template: {
    ...user,
  },
};

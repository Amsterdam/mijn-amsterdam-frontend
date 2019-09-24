const user = require('../json/brp.json');

module.exports = {
  path: '/api/brp/brp',
  delay: 5000,
  template: {
    ...user,
  },
};

const user = require('../json/brp.json');

module.exports = {
  path: '/api/brp/brp',
  delay: 500,
  template: {
    ...user,
  },
};

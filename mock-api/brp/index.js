const user = require('../json/brp.json');

module.exports = {
  path: '/api/brp/brp',
  template: {
    ...user,
  },
};

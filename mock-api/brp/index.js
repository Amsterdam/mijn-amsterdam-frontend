const user = require('../secure-data/brp.json');

module.exports = {
  path: '/api/brp/brp',
  template: {
    ...user,
  },
};

const updates = require('../secure-data/mijn-updates.json');

module.exports = {
  path: '/api/profiel/mijn-updates',
  template: (_, queryParams) => {
    return updates.slice(queryParams.offset, queryParams.limit);
  },
};

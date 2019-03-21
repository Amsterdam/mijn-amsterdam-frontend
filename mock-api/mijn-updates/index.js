const updates = require('./updates.json');

module.exports = {
  path: '/api/profiel/mijn-updates',
  template: (_, queryParams) => {
    return updates.slice(queryParams.offset, queryParams.limit);
  },
};

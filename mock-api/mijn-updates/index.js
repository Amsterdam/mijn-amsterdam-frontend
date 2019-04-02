const updates = require('../secure-data/mijn-updates.json');

module.exports = {
  path: '/api/profiel/mijn-updates',
  template: (_, queryParams) => {
    return {
      total: updates.length,
      offset: queryParams.offset,
      limit: queryParams.limit,
      items: updates.slice(queryParams.offset, queryParams.limit),
    };
  },
};

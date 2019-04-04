const tips = require('../secure-data/mijn-tips.json');

module.exports = {
  path: '/api/profiel/mijn-tips',
  template: (_, queryParams) => {
    return {
      total: tips.length,
      offset: queryParams.offset,
      limit: queryParams.limit,
      items: tips.slice(queryParams.offset, queryParams.limit),
    };
  },
};

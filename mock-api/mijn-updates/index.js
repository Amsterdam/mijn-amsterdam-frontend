// const items = require('../secure-data/mijn-updates.json');
const items = [];

module.exports = {
  path: '/api/mijn-updates',
  template: (_, queryParams) => {
    return {
      total: items.length,
      offset: queryParams.offset,
      limit: queryParams.limit,
      items: items.slice(queryParams.offset, queryParams.limit),
    };
  },
};

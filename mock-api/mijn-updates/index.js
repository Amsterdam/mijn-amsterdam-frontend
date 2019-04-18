// const focus = require('../secure-data/focus.json');

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

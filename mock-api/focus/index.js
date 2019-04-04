const focus = require('../secure-data/focus.json');
const items = Object.values(focus);

module.exports = {
  path: '/api/focus/aanvragen',
  template: (_, queryParams) => {
    return {
      total: items.length,
      offset: queryParams.offset,
      limit: queryParams.limit,
      items: items.slice(queryParams.offset, queryParams.limit),
    };
  },
};

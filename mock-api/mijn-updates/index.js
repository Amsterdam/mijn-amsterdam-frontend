const updates = require('updates.json');

module.exports = {
  path: '/mijn-updates',
  template: (_, queryParams) => {
    return updates.slice(queryParams.offset, queryParams.limit);
  },
};

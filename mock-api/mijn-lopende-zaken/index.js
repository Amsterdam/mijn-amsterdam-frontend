const items = require('../secure-data/mijn-lopende-zaken.json');

module.exports = {
  path: '/api/profiel/mijn-lopende-zaken',
  template: (_, queryParams) => {
    return {
      total: items.length,
      offset: queryParams.offset,
      limit: queryParams.limit,
      items: items.slice(queryParams.offset, queryParams.limit),
    };
  },
};

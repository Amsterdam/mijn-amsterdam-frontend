const items = require('../secure-data/mijn-lopende-zaken.json');

module.exports = {
  path: '/api/profiel/mijn-lopende-zaken',
  template: (_, queryParams) => {
    return items.slice(queryParams.offset, queryParams.limit);
  },
};

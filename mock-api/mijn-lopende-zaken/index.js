const tips = require('./mijn-lopende-zaken.json');

module.exports = {
  path: '/api/profiel/mijn-lopende-zaken',
  template: (_, queryParams) => {
    return tips.slice(queryParams.offset, queryParams.limit);
  },
};

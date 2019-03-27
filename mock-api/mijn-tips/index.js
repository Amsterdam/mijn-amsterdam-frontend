const tips = require('./mijn-tips.json');

module.exports = {
  path: '/api/profiel/mijn-tips',
  template: (_, queryParams) => {
    return tips.slice(queryParams.offset, queryParams.limit);
  },
};

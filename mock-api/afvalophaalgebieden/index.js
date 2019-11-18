const data = require('../json/afvalophaalgebieden.json');

module.exports = {
  path: '/api/afvalophaalgebieden/search',
  // delay: 5000,
  template: (_, queryParams) => {
    return data;
  },
};

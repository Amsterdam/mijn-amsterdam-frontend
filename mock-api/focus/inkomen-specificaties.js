const data = require('../json/inkomen-specificaties.json');

module.exports = {
  path: '/api/focus/combined',
  // delay: 11000,
  template: (_, queryParams) => {
    return data;
  },
};

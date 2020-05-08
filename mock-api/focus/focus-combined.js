const data = require('../json/focus-combined.json');

module.exports = {
  path: '/api/focus/combined',
  // delay: 11000,
  template: (_, queryParams) => {
    return data;
  },
};

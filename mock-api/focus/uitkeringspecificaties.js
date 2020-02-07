const uitkeringspecificaties = require('../json/uitkeringspecificaties.json');

module.exports = {
  path: '/api/focus/specificaties',
  // delay: 11000,
  template: (_, queryParams) => {
    return uitkeringspecificaties;
  },
};

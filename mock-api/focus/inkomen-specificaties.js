const uitkeringspecificaties = require('../json/inkomen-specificaties.json');

module.exports = {
  path: '/api/focus/inkomen-specificaties',
  // delay: 11000,
  template: (_, queryParams) => {
    return uitkeringspecificaties;
  },
};

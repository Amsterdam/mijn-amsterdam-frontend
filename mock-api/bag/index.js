const data = require('../json/bag.json');

module.exports = {
  path: '/api/atlas/search/adres/|/atlas/search/adres/',
  template: {
    ...data,
  },
};

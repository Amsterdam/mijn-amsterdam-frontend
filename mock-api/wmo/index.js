const wmo = require('../json/wmo.json');

module.exports = {
  path: '/api/wmoned/voorzieningen',
  template: (_, queryParams) => {
    return wmo;
  },
};

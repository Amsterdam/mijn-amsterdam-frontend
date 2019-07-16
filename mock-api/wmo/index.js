const focus = require('../json/wmo.json');

module.exports = {
  path: '/api/wmoned/voorzieningen',
  template: (_, queryParams) => {
    return {
      items: focus,
    };
  },
};

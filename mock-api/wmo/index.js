const focus = require('../secure-data/wmo.json');

module.exports = {
  path: '/api/wmoned/voorzieningen',
  template: (_, queryParams) => {
    return {
      items: focus,
    };
  },
};

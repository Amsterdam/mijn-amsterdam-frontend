const focus = require('../secure-data/focus.json');

module.exports = {
  path: '/api/focus',
  template: (_, queryParams) => {
    return {
      items: focus,
    };
  },
};

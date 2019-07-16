const focus = require('../json/focus.json');

module.exports = {
  path: '/api/focus/aanvragen',
  template: (_, queryParams) => {
    return {
      items: focus,
    };
  },
};

const focus = require('../json/focus.json');

module.exports = {
  path: '/api/focus/aanvragen',
  // delay: 11000,
  template: (_, queryParams) => {
    return focus;
  },
};

const data = require('../json/mijn-tips.json');

module.exports = {
  path: '/api/tips/gettips',
  method: 'POST',
  template: (_, queryParams) => {
    return {
      total: data.total,
      items: data.items,
    };
  },
};

const data = require('../json/mijn-tips.json');

module.exports = {
  path: '/api/tips/gettips',
  method: 'POST',
  template: (_, queryParams) => {
    return {
      total: data.tips.length,
      items: data.tips.slice(queryParams.offset, queryParams.limit),
    };
  },
};

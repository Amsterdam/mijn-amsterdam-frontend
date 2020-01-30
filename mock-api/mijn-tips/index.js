const data = require('../json/mijn-tips.json');

module.exports = {
  path: '/api/tips/gettips',
  method: 'POST',
  template: (_, queryParams, body) => {
    const items = JSON.parse(JSON.stringify(data.items));
    if (body && body.optin) {
      items[0].title = 'PERSONAL: ' + items[0].title;
    }
    return { items };
  },
};

const user = require('../json/brp.json');

module.exports = {
  path: '/api/brp/brp',
  // delay: 0,
  // status: (req, res, next) => {
  //   res.status(502);
  //   next();
  // },
  template: {
    ...user,
  },
};

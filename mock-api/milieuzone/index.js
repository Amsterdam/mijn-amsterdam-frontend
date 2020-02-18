const data = require('../json/milieuzone.json');

module.exports = {
  path: '/api/milieuzones/get',
  // delay: 11000,
  template: (_, queryParams) => {
    // return { status: 'ERROR', message: 'Invalid BSN' };
    return data;
  },
  status(req, res, next) {
    // res.status(400);
    next();
  },
};

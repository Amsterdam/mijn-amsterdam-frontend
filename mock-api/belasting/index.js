const belasting = require('../json/belasting.json');

module.exports = {
  path: '/api/belasting/get',
  // delay: 11000,
  template: (_, queryParams) => {
    return { status: 'ERROR', message: 'Invalid BSN' };
  },
  status(req, res, next) {
    res.status(400);
    next();
  },
};

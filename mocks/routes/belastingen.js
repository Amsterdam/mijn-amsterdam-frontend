const BELASTINGEN = require('../fixtures/belastingen.json');

module.exports = [
  {
    id: 'get-belastingen',
    url: '/remote/belastingen',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: BELASTINGEN,
        },
      },
      {
        id: 'commercial-user',
        type: 'middleware',
        options: {
          middleware: (req, resp, next, core) => {
            console.log(req);
            core.logger.info('recieved');
            resp.status(200);
            resp.send('TEST');
          },
        },
      },
    ],
  },
];

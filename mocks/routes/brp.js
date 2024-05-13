const BRP_RESPONSE = require('../fixtures/brp.json');

module.exports = [
  {
    id: 'get-brp',
    url: '/api/brp/brp',
    method: 'GET',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            console.dir(req.headers);
            if (req.headers.Authorization) {
              const jwtDecoded = jose.decodeJwt(
                req.headers.Authorization.split(' ')[1]
              );
              core.logger.info(jwtDecoded);
              if (!jwtDecoded) {
                core.logger.error(
                  `No bearer token in jwtDecoded: ${jwtDecoded}`
                );
                res.status(401);
                res.send('No bearer token');
                return;
              }
            }
            res.status(200);
            res.send(BRP_RESPONSE);
          },
        },
      },
    ],
  },
];

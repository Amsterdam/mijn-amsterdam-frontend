const { register } = require('module');
const settings = require('../settings');
//const BELASTINGEN = require('../fixtures/belastingen.json');
//https://www.mocks-server.org/docs/usage/variants/middleware/

module.exports = [
  {
    id: 'get-patroon-c',
    url: `${settings.MOCK_BASE_PATH}/sso/portaal/:naamportaal?`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            const htmlResponse = `
            <h1>${req.params.naamportaal}</h1>
            <a href="http://localhost:3000">
              Startpagina
            </a>`;
            res.send(htmlResponse);
          },
        },
      },
    ],
  },
];

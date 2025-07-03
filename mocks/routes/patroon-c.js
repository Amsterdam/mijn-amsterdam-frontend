import process from "node:process";
const { register } = require('module');
const settings = require('../settings');

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
             <a href="${process.env.MA_FRONTEND_URL}">
              Mijn Amsterdam
            </a>`;
            res.send(htmlResponse);
          },
        },
      },
    ],
  },
];

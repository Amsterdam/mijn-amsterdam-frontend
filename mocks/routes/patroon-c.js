import process from 'node:process';

import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'get-patroon-c',
    url: `${MOCK_BASE_PATH}/sso/portaal/:naamportaal?`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, _next, _core) => {
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

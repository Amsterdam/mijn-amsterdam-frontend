import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-patroon-c',
    url: `${MOCK_BASE_PATH}/sso/portaal`,
    method: 'GET',
    variants: [
      {
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const htmlResponse = `
            <h1>${req.params.naamportaal ?? ''}</h1>
             <a href="${process.env.MA_FRONTEND_URL}">
              Mijn Amsterdam
            </a>`;
            return res.send(htmlResponse);
          },
        },
      },
    ],
  },
  {
    id: 'get-patroon-c-met-naamportaal',
    url: `${MOCK_BASE_PATH}/sso/portaal/:naamportaal`,
    method: 'GET',
    variants: [
      {
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const htmlResponse = `
            <h1>${req.params.naamportaal}</h1>
             <a href="${process.env.MA_FRONTEND_URL}">
              Mijn Amsterdam
            </a>`;
            return res.send(htmlResponse);
          },
        },
      },
    ],
  },
];

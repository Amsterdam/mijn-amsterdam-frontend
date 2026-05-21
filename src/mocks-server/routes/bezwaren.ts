import BEZWAREN_DOCUMENTEN_RESPONSE from '../fixtures/bezwaren-documents.json' with { type: 'json' };
import BEZWAREN_STATUS_RESPONSE from '../fixtures/bezwaren-status.json' with { type: 'json' };
import BEZWAREN_LIST_RESPONSE from '../fixtures/bezwaren.json' with { type: 'json' };
import { sendMockDocument } from '../helpers/send-mock-document.ts';
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'post-bezwaren-list',
    url: `${MOCK_BASE_PATH}/bezwaren/zgw/v1/zaken/_zoek`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const bezwaren = BEZWAREN_LIST_RESPONSE.results;

            return res.status(200).send({
              ...BEZWAREN_LIST_RESPONSE,
              results: Array.from({ length: 4 })
                .flatMap(() => bezwaren)
                .map((bezwaar, index) => ({
                  ...bezwaar,
                  uuid: `${bezwaar.uuid} -- ${index}`,
                  identificatie: `${bezwaar.identificatie} -- ${index}`,
                })),
            });
          },
        },
      },
    ],
  },
  {
    id: 'get-bezwaren-documenten',
    url: `${MOCK_BASE_PATH}/bezwaren/zgw/v1/enkelvoudiginformatieobjecten`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BEZWAREN_DOCUMENTEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-bezwaren-download-document',
    url: `${MOCK_BASE_PATH}/bezwaren/zgw/v1/enkelvoudiginformatieobjecten/:id/download`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            sendMockDocument(res, 200);
          },
        },
      },
    ],
  },
  {
    id: 'get-bezwaren-status',
    url: `${MOCK_BASE_PATH}/bezwaren/zgw/v1/statussen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BEZWAREN_STATUS_RESPONSE,
        },
      },
    ],
  },
];

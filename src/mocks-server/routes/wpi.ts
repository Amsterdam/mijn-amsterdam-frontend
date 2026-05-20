import WPI_AANVRAGEN_RESPONSE from '../fixtures/wpi-aanvragen.json' with { type: 'json' };
import WPI_E_AANVRAGEN_RESPONSE from '../fixtures/wpi-e-aanvragen.json' with { type: 'json' };
import WPI_SPECIFICATIES_RESPONSE from '../fixtures/wpi-specificaties.json' with { type: 'json' };
import { sendMockDocument } from '../helpers/send-mock-document.ts';
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const wpiRoutes: MockRouteDefinition[] = [
  {
    id: 'get-wpi-aanvragen',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/aanvragen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: WPI_AANVRAGEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-wpi-e-aanvragen',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/e-aanvragen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: WPI_E_AANVRAGEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-wpi-specificaties',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/specificaties-en-jaaropgaven`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: WPI_SPECIFICATIES_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-wpi-document-download',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/document`,
    method: 'POST',
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
];

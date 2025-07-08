import AANVRAGEN from '../fixtures/wpi-aanvragen.json' with { type: 'json' };
import E_AANVRAGEN from '../fixtures/wpi-e-aanvragen.json' with { type: 'json' };
import SPECIFICATIES from '../fixtures/wpi-specificaties.json' with { type: 'json' };
import { MOCK_BASE_PATH, MOCK_DOCUMENT_PATH } from '../settings.js';

export default [
  {
    id: 'get-wpi-aanvragen',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/aanvragen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: AANVRAGEN,
        },
      },
    ],
  },
  {
    id: 'get-wpi-e-aanvragen',
    method: 'GET',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/e-aanvragen`,
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: E_AANVRAGEN,
        },
      },
    ],
  },
  {
    id: 'get-wpi-specificaties',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/specificaties-en-jaaropgaven`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SPECIFICATIES,
        },
      },
    ],
  },
  {
    id: 'get-wpi-document-download',
    url: `${MOCK_BASE_PATH}/wpi-koppel-api/wpi/document`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];

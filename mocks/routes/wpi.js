const settings = require('../settings.js');

const RESPONSES = {
  AANVRAGEN: require('../fixtures/wpi-aanvragen.json'),
  E_AANVRAGEN: require('../fixtures/wpi-e-aanvragen.json'),
  SPECIFICATIES: require('../fixtures/wpi-specificaties.json'),
};

module.exports = [
  {
    id: 'get-wpi-aanvragen',
    url: `${settings.MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/aanvragen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.AANVRAGEN,
        },
      },
    ],
  },
  {
    id: 'get-wpi-e-aanvragen',
    method: 'GET',
    url: `${settings.MOCK_BASE_PATH}/wpi-koppel-api/wpi/e-aanvragen`,
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.E_AANVRAGEN,
        },
      },
    ],
  },
  {
    id: 'get-wpi-specificaties',
    url: `${settings.MOCK_BASE_PATH}/wpi-koppel-api/wpi/uitkering/specificaties-en-jaaropgaven`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.SPECIFICATIES,
        },
      },
    ],
  },
  {
    id: 'get-wpi-document-download',
    url: `${settings.MOCK_BASE_PATH}/wpi-koppel-api/wpi/document`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: settings.MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];

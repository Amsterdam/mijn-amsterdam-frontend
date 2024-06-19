const settings = require('../settings.js');
const { loadFixture } = require('../loadJSON.js');
const path = require('node:path');

const RESPONSES = {
  AANVRAGEN: loadFixture('wpi-aanvragen.json'),
  E_AANVRAGEN: loadFixture('wpi-e-aanvragen.json'),
  SPECIFICATIES: loadFixture('wpi-specificaties.json'),
};

module.exports = [
  {
    id: 'get-wpi-aanvragen',
    url: `${settings.MOCK_BASE_PATH}/wpi/uitkering/aanvragen`,
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
    url: `${settings.MOCK_BASE_PATH}/wpi/e-aanvragen`,
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
    url: `${settings.MOCK_BASE_PATH}/wpi/uitkering/specificaties-en-jaaropgaven`,
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
    url: '/wpi/document',
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

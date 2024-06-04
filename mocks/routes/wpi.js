const RESPONSES = {
  AANVRAGEN: require('../fixtures/wpi-aanvragen.json'),
  E_AANVRAGEN: require('../fixtures/wpi-e-aanvragen.json'),
  SPECIFICATIES: require('../fixtures/wpi-specificaties.json'),
};

module.exports = [
  {
    id: 'get-wpi-aanvragen',
    url: '/api/wpi/uitkering/aanvragen',
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
    url: '/api/wpi/e-aanvragen',
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
    url: '/api/wpi/uitkering/specificaties-en-jaaropgaven',
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
    url: '/api/wpi/document',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: '../fixtures/documents/document.pdf',
        },
      },
    ],
  },
];

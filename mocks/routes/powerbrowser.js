const settings = require('../settings');
const BB_VERGUNNINGEN = require('../fixtures/powerbrowser-bb-vergunningen.json');
const BB_VERGUNNING_ATTACHMENTS = require('../fixtures/powerbrowser-bb-attachments.json');

module.exports = [
  {
    id: 'post-powerbrowser-vergunningen',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Report/RunSavedReport`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_VERGUNNINGEN,
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-token',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'text',
        options: {
          status: 200,
          body: '"xxxx-909090-yyyy"',
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-vergunning-attachments',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/link/GFO_ZAKEN/:zaaknummer`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_VERGUNNING_ATTACHMENTS,
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-bb-vergunning-attachments',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Dms/:id/Pdf`,
    method: 'POST',
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

const BB_VERGUNNINGEN = require('../fixtures/powerbrowser-bb-vergunningen.json');
const BB_VERGUNNING_ATTACHMENTS = require('../fixtures/powerbrowser-bb-attachments.json');

module.exports = [
  {
    id: 'post-powerbrowser-vergunningen',
    url: '/remote/powerbrowser/Report/RunSavedReport',
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
    url: '/remote/powerbrowser/Token',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'text',
        options: {
          status: 200,
          body: 'xxxx-909090-yyyy',
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-vergunning-attachments',
    url: '/remote/powerbrowser/link/GFO_ZAKEN/:zaaknummer',
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
    url: '/remote/powerbrowser/Dms',
    method: 'POST',
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
];

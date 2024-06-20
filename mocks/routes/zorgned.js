const ZORGNED_JZD_RESPONSE = require('../fixtures/zorgned-jzd.json');
const ZORGNED_AV_RESPONSE = require('../fixtures/zorgned-av.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-zorgned-jzd',
    url: `${settings.MOCK_BASE_PATH}/zorgned/aanvragen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZORGNED_JZD_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-zorgned-av',
    url: `${settings.MOCK_BASE_PATH}/zorgned/persoonsgegevensNAW`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZORGNED_AV_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-zorgned-wmo-document',
    url: `${settings.MOCK_BASE_PATH}/zorgned/document`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: settings.DOCUMENT_IN_OBJECT,
        },
      },
    ],
  },
];

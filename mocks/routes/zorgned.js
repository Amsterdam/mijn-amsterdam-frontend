const ZORGNED_AV_AANVRAGEN_RESPONSE = require('../fixtures/zorgned-av-aanvragen.json');
const ZORGNED_JZD_AANVRAGEN_RESPONSE = require('../fixtures/zorgned-jzd-aanvragen.json');
const ZORGNED_AV_PERSOONSGEGEVENSNAW_RESPONSE = require('../fixtures/zorgned-av-persoonsgegevensNAW.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'post-zorgned-aanvragen',
    url: `${settings.MOCK_BASE_PATH}/zorgned/aanvragen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            if (!('x-mams-api-user' in req.headers)) {
              return res
                .status(500)
                .send('x-mams-api-user key not found in request headers.');
            }
            return res.send(
              req.headers['x-mams-api-user'] === 'AV'
                ? ZORGNED_AV_AANVRAGEN_RESPONSE
                : ZORGNED_JZD_AANVRAGEN_RESPONSE
            );
          },
        },
      },
    ],
  },
  {
    id: 'post-zorgned-persoonsgegevens',
    url: `${settings.MOCK_BASE_PATH}/zorgned/persoonsgegevensNAW`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZORGNED_AV_PERSOONSGEGEVENSNAW_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'post-zorgned-document',
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

const ZORGNED_AV_AANVRAGEN_RESPONSE = require('../fixtures/zorgned-av-aanvragen.json');
const ZORGNED_JZD_AANVRAGEN_RESPONSE = require('../fixtures/zorgned-jzd-aanvragen.json');
const ZORGNED_LLV_AANVRAGEN_RESPONSE = require('../fixtures/zorgned-leerlingenvervoer-aanvragen.json');
const ZORGNED_AV_PERSOONSGEGEVENSNAW_RESPONSE = require('../fixtures/zorgned-av-persoonsgegevensNAW.json');
const settings = require('../settings.js');
const { HttpStatusCode } = require('axios');

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
          middleware: (req, res, _next, core) => {
            if (!('x-mams-api-user' in req.headers)) {
              return res
                .status(HttpStatusCode.BadRequest)
                .send('x-mams-api-user key not found in request headers.');
            }

            const apiUser = req.headers['x-mams-api-user'];
            switch (apiUser) {
              case 'AV': {
                return res.send(ZORGNED_AV_AANVRAGEN_RESPONSE);
              }
              case 'JZD': {
                return res.send(ZORGNED_JZD_AANVRAGEN_RESPONSE);
              }
              case 'LLV': {
                return res.send(ZORGNED_LLV_AANVRAGEN_RESPONSE);
              }
              default: {
                const msg = `No fixture response found for ${apiUser}`;
                core.logger.error(msg);
                return res.status(HttpStatusCode.NotFound).send(msg);
              }
            }
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
          body: { inhoud: settings.MOCK_DOCUMENT_B64 },
        },
      },
    ],
  },
];

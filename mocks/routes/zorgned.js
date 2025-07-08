import { HttpStatusCode } from 'axios';

import AV_RTM_AANVRAGEN from '../fixtures/zorgned-av-aanvragen-rtm.json' with { type: 'json' };
import AV_AANVRAGEN from '../fixtures/zorgned-av-aanvragen.json' with { type: 'json' };
import AV_PERSOONSGEGEVENSNAW_RESPONSE from '../fixtures/zorgned-av-persoonsgegevensNAW.json' with { type: 'json' };
import JZD_AANVRAGEN_RESPONSE from '../fixtures/zorgned-jzd-aanvragen.json' with { type: 'json' };
import LLV_AANVRAGEN_RESPONSE from '../fixtures/zorgned-leerlingenvervoer-aanvragen.json' with { type: 'json' };
import { MOCK_BASE_PATH, MOCK_DOCUMENT_B64 } from '../settings.js';

export default [
  {
    id: 'post-zorgned-aanvragen',
    url: `${MOCK_BASE_PATH}/zorgned/aanvragen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, _next, core) => {
            if (!('x-cache-key-supplement' in req.headers)) {
              return res
                .status(HttpStatusCode.BadRequest)
                .send('x-mams-api-user key not found in request headers.');
            }

            const apiUser = req.headers['x-cache-key-supplement'];
            switch (apiUser) {
              case 'AV': {
                const aanvragen = {
                  _embedded: {
                    aanvraag: [
                      ...AV_AANVRAGEN._embedded.aanvraag,
                      ...AV_RTM_AANVRAGEN._embedded.aanvraag,
                    ],
                  },
                };
                return res.send(aanvragen);
              }
              case 'JZD': {
                return res.send(JZD_AANVRAGEN_RESPONSE);
              }
              case 'LLV': {
                return res.send(LLV_AANVRAGEN_RESPONSE);
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
    url: `${MOCK_BASE_PATH}/zorgned/persoonsgegevensNAW`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware(req, res, _next) {
            const nawResponse = structuredClone(
              AV_PERSOONSGEGEVENSNAW_RESPONSE
            );
            if (nawResponse) {
              nawResponse.persoon.bsn = req.body.burgerservicenummer;
              nawResponse.persoon.voornamen = `${req.body.burgerservicenummer} - ${nawResponse.persoon.voornamen}`;
            }
            return res.status(HttpStatusCode.Ok).send(nawResponse);
          },
        },
      },
    ],
  },
  {
    id: 'post-zorgned-document',
    url: `${MOCK_BASE_PATH}/zorgned/document`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { inhoud: MOCK_DOCUMENT_B64 },
        },
      },
    ],
  },
];

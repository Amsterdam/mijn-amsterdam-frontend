import { HttpStatusCode } from 'axios';

import ZORGNED_AV_AANVRAGEN_RESPONSE_RTM from '../fixtures/zorgned-av-aanvragen-rtm.json' with { type: 'json' };
import ZORGNED_AV_AANVRAGEN_RESPONSE from '../fixtures/zorgned-av-aanvragen.json' with { type: 'json' };
import ZORGNED_AV_PERSOONSGEGEVENSNAW_RESPONSE from '../fixtures/zorgned-av-persoonsgegevensNAW.json' with { type: 'json' };
import ZORGNED_JZD_AANVRAGEN_RESPONSE from '../fixtures/zorgned-jzd-aanvragen.json' with { type: 'json' };
import ZORGNED_LLV_AANVRAGEN_RESPONSE from '../fixtures/zorgned-leerlingenvervoer-aanvragen.json' with { type: 'json' };
import { MOCK_BASE_PATH, MOCK_DOCUMENT_B64 } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

type ZorgnedApiUser = 'AV' | 'JZD' | 'LLV';

function hasApiUserHeader(
  headers: Record<string, unknown>
): headers is Record<string, string | string[]> {
  return 'x-cache-key-supplement' in headers;
}

export const zorgnedRoutes: MockRouteDefinition[] = [
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
            if (!hasApiUserHeader(req.headers)) {
              return res
                .status(HttpStatusCode.BadRequest)
                .send(
                  'x-cache-key-supplement key not found in request headers. This header is required to determine the correct fixture for the response.'
                );
            }

            const rawApiUser = req.headers['x-cache-key-supplement'];
            const apiUser = (
              Array.isArray(rawApiUser) ? rawApiUser[0] : rawApiUser
            ) as ZorgnedApiUser | string;

            switch (apiUser) {
              case 'AV': {
                const aanvragen = {
                  _embedded: {
                    aanvraag: [
                      ...ZORGNED_AV_AANVRAGEN_RESPONSE._embedded.aanvraag,
                      ...ZORGNED_AV_AANVRAGEN_RESPONSE_RTM._embedded.aanvraag,
                    ],
                  },
                };

                return res.status(HttpStatusCode.Ok).send(aanvragen);
              }
              case 'JZD':
                return res
                  .status(HttpStatusCode.Ok)
                  .send(ZORGNED_JZD_AANVRAGEN_RESPONSE);
              case 'LLV':
                return res
                  .status(HttpStatusCode.Ok)
                  .send(ZORGNED_LLV_AANVRAGEN_RESPONSE);
              default: {
                const message = `No fixture response found for ${apiUser}`;
                core.logger.error(message);
                return res.status(HttpStatusCode.NotFound).send(message);
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
          middleware: (req, res) => {
            const nawResponse = structuredClone(
              ZORGNED_AV_PERSOONSGEGEVENSNAW_RESPONSE
            );

            if (nawResponse) {
              const bsn = req.body.burgerservicenummer;
              nawResponse.persoon.bsn = bsn;
              nawResponse.persoon.voornamen = `${bsn} - ${nawResponse.persoon.voornamen}`;
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

import { constants as httpConstants } from 'node:http2';

import AVG_THEMAS_RESPONSE from '../fixtures/avg-themas.json' with { type: 'json' };
import AVG_RESPONSE from '../fixtures/avg.json' with { type: 'json' };
import KLACHTEN_RESPONSE from '../fixtures/klachten.json' with { type: 'json' };
import { parseMultipartForm } from '../helpers/formidable.ts';
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

for (const responseObj of [
  AVG_THEMAS_RESPONSE,
  AVG_RESPONSE,
  KLACHTEN_RESPONSE,
]) {
  responseObj.rowcount = 10;
}

function firstFieldValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export const routes: MockRouteDefinition[] = [
  {
    id: 'post-enableu2smile-klachten',
    url: `${MOCK_BASE_PATH}/smile`,
    method: 'POST',
    handler: {
      type: 'middleware',
      middleware: async (req, res, _next, core) => {
        try {
          const fields = await parseMultipartForm(req);
          const fn = firstFieldValue(
            fields.function as string | string[] | undefined
          );

          if (!fn) {
            core.logger.error(
              "No 'function' property on multipart fields for /smile route"
            );
            return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).end();
          }

          if (fn === 'readKlacht') {
            return res.status(200).send(KLACHTEN_RESPONSE);
          }

          if (fn === 'readAVGverzoek') {
            return res.status(200).send(AVG_RESPONSE);
          }

          if (fn === 'readthemaperavgverzoek') {
            return res.status(200).send(AVG_THEMAS_RESPONSE);
          }

          return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).end();
        } catch (error) {
          core.logger.error(String(error));
          return res
            .status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
            .end();
        }
      },
    },
  },
];

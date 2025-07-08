import AVG_THEMAS_RESPONSE from '../fixtures/avg-themas.json' with { type: 'json' };
import AVG_RESPONSE from '../fixtures/avg.json' with { type: 'json' };
import KLACHTEN_RESPONSE from '../fixtures/klachten.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

function isIncomingFormFunction(identifier) {
  return (fields, core) => {
    if (!fields?.function) {
      core.logger.error(
        "No 'function' property on 'fields'. \
      Make sure the multipart-form being send contains this."
      );
      return undefined;
    }
    return fields.function[0] == identifier;
  };
}

export default [
  {
    id: 'post-enableu2smile-klachten',
    url: `${MOCK_BASE_PATH}/smile`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'intermediate-api-handler',
        options: {
          klachten: {
            isMatch: isIncomingFormFunction('readKlacht'),
            body: KLACHTEN_RESPONSE,
            statusCode: 200,
          },
          avg: {
            isMatch: isIncomingFormFunction('readAVGverzoek'),
            body: AVG_RESPONSE,
            statusCode: 200,
          },
          avgThemas: {
            isMatch: isIncomingFormFunction('readthemaperavgverzoek'),
            body: AVG_THEMAS_RESPONSE,
            statusCode: 200,
          },
        },
      },
    ],
  },
];

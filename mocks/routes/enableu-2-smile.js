const AVG_THEMAS_RESPONSE = require('../fixtures/avg-themas.json');
const AVG_RESPONSE = require('../fixtures/avg.json');
const KLACHTEN_RESPONSE = require('../fixtures/klachten.json');
const settings = require('../settings');

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

module.exports = [
  {
    id: 'post-enableu2smile-klachten',
    url: `${settings.MOCK_BASE_PATH}/smile`,
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

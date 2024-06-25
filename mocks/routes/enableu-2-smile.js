const AVG_RESPONSE = require('../fixtures/avg.json');
const AVG_THEMAS_RESPONSE = require('../fixtures/avg-themas.json');
const KLACHTEN_RESPONSE = require('../fixtures/klachten.json');
const settings = require('../settings');

function getSmileIdentifyingField(fields) {
  return fields.function[0];
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
            identifier: 'readKlacht',
            getFieldWithIdentifier: getSmileIdentifyingField,
            body: KLACHTEN_RESPONSE,
          },
          avg: {
            identifier: 'readAVGverzoek',
            getFieldWithIdentifier: getSmileIdentifyingField,
            body: AVG_RESPONSE,
          },
          avgThemas: {
            identifier: 'readthemaperavgverzoek',
            getFieldWithIdentifier: getSmileIdentifyingField,
            body: AVG_THEMAS_RESPONSE,
          },
        },
      },
    ],
  },
];

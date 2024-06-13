const KLACHTEN_RESPONSE = require('../fixtures/klachten.json');
const AVG_RESPONSE = require('../fixtures/avg.json');
const AVG_THEMAS_RESPONSE = require('../fixtures/avg-themas.json');

function getSmileIdentifyingField(fields) {
  return fields.function[0];
}

module.exports = [
  {
    id: 'get-enableu2smile-klachten',
    url: '/remote/smile',
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

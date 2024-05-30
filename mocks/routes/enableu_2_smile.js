const KLACHTEN_RESPONSE = require('../fixtures/klachten.json');
const AVG_RESPONSE = require('../fixtures/avg.json');
const AVG_THEMAS_RESPONSE = require('../fixtures/avg-themas.json');

// RP TODO: AVG takes long to load? seems to be blocked by get-kvk, because this appears after it's delay
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
            body: KLACHTEN_RESPONSE,
          },
          avg: {
            identifier: 'readAVGverzoek',
            body: AVG_RESPONSE,
          },
          avgThemas: {
            identifier: 'readthemaperavgverzoek',
            body: AVG_THEMAS_RESPONSE,
          },
        },
      },
    ],
  },
];

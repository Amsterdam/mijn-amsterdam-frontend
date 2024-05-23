const PRIVATE_RESPONSE = require('../fixtures/vergunningen.json');
const COMMERCIAL_RESPONSE =
  PRIVATE_RESPONSE.content.filter(noCommercialPermits);

function noCommercialPermits(vergunning) {
  return ![
    'Vakantieverhuur vergunningsaanvraag',
    'Parkeerontheffingen Blauwe zone particulieren',
  ].includes(vergunning.caseType);
}

module.exports = [
  {
    id: 'get-verguninngen',
    url: '/api/decosjoin/getvergunningen',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: PRIVATE_RESPONSE,
          },
          commercialUser: {
            status: 200,
            body: {
              content: { ...COMMERCIAL_RESPONSE },
              status: 'OK',
            },
          },
        },
      },
    ],
  },
];

const path = require('node:path');

const PRIVATE_RESPONSE = require('../fixtures/vergunningen.json');
const VERGUNNINGEN_DOCUMENTS_LIST = require('../fixtures/vergunningen-documenten.json');
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
    id: 'vergunningen-download-document',
    url: '/decosjoin/document/:encryptedID',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: path.resolve('/mocks/fixtures/documents/document.pdf'),
        },
      },
    ],
  },
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
  {
    id: 'vergunningen-list-documents',
    url: '/decosjoin/listdocuments/:encryptedID',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: VERGUNNINGEN_DOCUMENTS_LIST,
        },
      },
    ],
  },
];

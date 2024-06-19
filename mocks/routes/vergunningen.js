const path = require('node:path');
const settings = require('../settings.js');
const { loadFixture } = require('../loadJSON.js');

const PRIVATE_RESPONSE = loadFixture('vergunningen.json');
const COMMERCIAL_RESPONSE =
  PRIVATE_RESPONSE.content.filter(noCommercialPermits);

const VERGUNNINGEN_DOCUMENTS_LIST = loadFixture('vergunningen-documenten.json');

function noCommercialPermits(vergunning) {
  return ![
    'Vakantieverhuur vergunningsaanvraag',
    'Parkeerontheffingen Blauwe zone particulieren',
  ].includes(vergunning.caseType);
}

module.exports = [
  {
    id: 'get-vergunningen-download-document',
    url: '/decosjoin/document/:encryptedID',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: settings.MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
  {
    id: 'get-verguninngen',
    url: `${settings.MOCK_BASE_PATH}/decosjoin/getvergunningen`,
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
              content: COMMERCIAL_RESPONSE,
              status: 'OK',
            },
          },
        },
      },
    ],
  },
  {
    id: 'get-vergunningen-list-documents',
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

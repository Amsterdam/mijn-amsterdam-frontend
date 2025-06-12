const LOODMETINGEN_RAPPORT_RESPONSE = require('../fixtures/loodmeting-rapport.json');
const LOODMETINGEN_RESPONSE = require('../fixtures/loodmetingen.json');
const settings = require('../settings');

module.exports = [
  {
    id: 'post-loodmetingen-details',
    url: `${settings.MOCK_BASE_PATH}/loodmetingen/be_getrequestdetails`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LOODMETINGEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'post-loodmetingen-rapport',
    url: `${settings.MOCK_BASE_PATH}/loodmetingen/be_downloadleadreport`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LOODMETINGEN_RAPPORT_RESPONSE,
        },
      },
    ],
  },
];

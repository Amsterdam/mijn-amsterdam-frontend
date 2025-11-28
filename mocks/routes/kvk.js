const maatschappelijkeactiviteiten = require('../fixtures/hr-kvk/maatschappelijkeactiviteiten.json');
const vestigingen = require('../fixtures/hr-kvk/vestigingen.json');
const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-kvk-maatschappelijkeactiviteiten',
    url: `${settings.MOCK_BASE_PATH}/hr_kvk/maatschappelijkeactiviteiten`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: {
              _embedded: { maatschappelijkeactiviteiten: [] },
            },
          },
          commercialUser: {
            status: 200,
            body: maatschappelijkeactiviteiten,
          },
        },
      },
    ],
  },
  {
    id: 'get-kvk-vestigingen',
    url: `${settings.MOCK_BASE_PATH}/hr_kvk/vestigingen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: {
              _embedded: { vestigingen: [] },
            },
          },
          commercialUser: {
            status: 200,
            body: vestigingen,
          },
        },
      },
    ],
  },
];

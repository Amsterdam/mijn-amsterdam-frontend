const settings = require('../settings');
const loadFixtureAndReplaceBaseUrl = require('../loadFixtureAndReplaceBaseUrl');

const ALLE_RESPONSE = loadFixtureAndReplaceBaseUrl(
  'cms-maintenance-notifications-alle.json'
);
const DASHBOARD_RESPONSE = require('../fixtures/cms-maintenance-notifications-dashboard.json');
const LANDINGSPAGE_RESPONSE = require('../fixtures/cms-maintenance-notifications-landingspagina.json');
const PRODUCTEN_OP_MA = require('../fixtures/cms-producten.json');
const FOOTER = require('../fixtures/cms-footer.json');

// The BFF Caches the responses to these requests in root/src/server/cache/
module.exports = [
  {
    id: 'get-cms-maintainance-notifications-alle',
    url: `${settings.MOCK_BASE_PATH}/cms/storingsmeldingen/alle-meldingen-mijn-amsterdam`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ALLE_RESPONSE,
        },
      },
    ],
  },
  // The first URL will get the endpoint of this one by reading maintenance-notifications-dashboard.json, the property 'feedid' will contain the URL.
  {
    id: 'get-cms-maintainance-notifications-dashboard',
    url: `${settings.MOCK_BASE_PATH}/cms/storingsmeldingen/alle-meldingen-mijn-amsterdam/dashboard`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: DASHBOARD_RESPONSE,
        },
      },
    ],
  },
  // Same comment as above
  {
    id: 'get-cms-maintainance-notifications-landingspagina',
    url: `${settings.MOCK_BASE_PATH}/cms/storingsmeldingen/alle-meldingen-mijn-amsterdam/landingspagina`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: LANDINGSPAGE_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-cms-productenlijst',
    url: `${settings.MOCK_BASE_PATH}/cms/mijn-content/artikelen/:articleslug/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: PRODUCTEN_OP_MA,
        },
      },
    ],
  },
  {
    id: 'get-cms-footer',
    url: `${settings.MOCK_BASE_PATH}/cms/algemene_onderdelen/overige/footer`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: FOOTER,
        },
      },
    ],
  },
];

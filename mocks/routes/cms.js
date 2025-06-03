const loadFixtureAndReplaceBaseUrl = require('../loadFixtureAndReplaceBaseUrl');
const settings = require('../settings');

const ALLE_RESPONSE = loadFixtureAndReplaceBaseUrl(
  'cms-maintenance-notifications-alle.json'
);
const DASHBOARD_RESPONSE = require('../fixtures/cms-maintenance-notifications-dashboard.json');
const LANDINGSPAGE_RESPONSE = require('../fixtures/cms-maintenance-notifications-landingspagina.json');
const PRODUCTEN_OP_MA = require('../fixtures/cms-producten.json');

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
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            const { articleslug } = req.params;
            if (articleslug === 'overzicht-producten-ondernemers') {
              const productenOndernemer = structuredClone(PRODUCTEN_OP_MA);
              productenOndernemer.applicatie.inhoud.inleiding = `<p><strong>Mock content voor BEDRIJVEN</strong></p>`;
              return res.send(productenOndernemer);
            }
            return res.send(PRODUCTEN_OP_MA);
          },
        },
      },
    ],
  },
];

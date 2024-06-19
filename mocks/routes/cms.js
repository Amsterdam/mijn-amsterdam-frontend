const loadFixture = require('../loadFixture');

const ALLE_RESPONSE = loadFixture('maintenance-notifications-alle.json');
const DASHBOARD_RESPONSE = require('../fixtures/maintenance-notifications-dashboard.json');
const LANDINGSPAGE_RESPONSE = require('../fixtures/maintenance-notifications-landingspagina.json');

// The BFF Caches the responses to these requests in root/src/server/cache/
module.exports = [
  {
    id: 'get-cms-maintainance-notifications-alle',
    url: '/storingsmeldingen/alle-meldingen-mijn-amsterdam',
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
    id: 'get-cms-maintainance-dashboard',
    url: '/storingsmeldingen/alle-meldingen-mijn-amsterdam/dashboard',
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
    id: 'get-cms-maintainance-landingspagina',
    url: '/storingsmeldingen/alle-meldingen-mijn-amsterdam/landingspagina',
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
];

const ALLE_RESPONSE = require('../fixtures/maintenance-notifications-alle.json');
const DASHBOARD_RESPONSE = require('../fixtures/maintenance-notifications-dashboard.json');
const LANDINGSPAGE_RESPONSE = require('../fixtures/maintenance-notifications-landingspagina.json');

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
  // RP TODO: Check bottom two endpoints, they are not being found.
  // BFF reads json of top request to then query the endpoints inside
  // Also don't forget to delete the cms caches
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

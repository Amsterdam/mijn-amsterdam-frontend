const loadFixtureAndReplaceBaseUrl = require('../loadFixtureAndReplaceBaseUrl');
const settings = require('../settings');

const ALLE_RESPONSE = loadFixtureAndReplaceBaseUrl(
  'cms-maintenance-notifications-alle.json'
);
const DETAIL_RESPONSE = require('../fixtures/cms-maintenance-notifications-item.json');
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
    id: 'get-cms-maintainance-notifications-by-page',
    url: `${settings.MOCK_BASE_PATH}/cms/storingsmeldingen/alle-meldingen-mijn-amsterdam/:page`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { page } = req.params;
            const r = structuredClone(DETAIL_RESPONSE);
            r.item.Url = `https://www.amsterdam.nl/storingsmeldingen/alle-meldingen-mijn-amsterdam/${page}/`;
            r.item.relUrl = `storingsmeldingen/alle-meldingen-mijn-amsterdam/${page}`;
            r.item.page.Lbl =
              page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ');
            return res.send(r);
          },
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
  {
    id: 'get-cms-footer',
    url: `${settings.MOCK_BASE_PATH}/cms/algemene_onderdelen/xxv/footer-xxv/`,
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

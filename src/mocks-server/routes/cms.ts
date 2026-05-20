import FOOTER from '../fixtures/cms-footer.json' with { type: 'json' };
import DETAIL_RESPONSE from '../fixtures/cms-maintenance-notifications-item.json' with { type: 'json' };
import PRODUCTEN_OP_MA from '../fixtures/cms-producten.json' with { type: 'json' };
import { loadFixtureAndReplaceBaseUrl } from '../helpers/load-fixture-and-replace-base-url.ts';
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

const ALLE_RESPONSE = loadFixtureAndReplaceBaseUrl(
  'cms-maintenance-notifications-alle.json'
);

export const cmsRoutes: MockRouteDefinition[] = [
  {
    id: 'get-cms-maintainance-notifications-alle',
    url: `${MOCK_BASE_PATH}/cms/storingsmeldingen/alle-meldingen-mijn-amsterdam`,
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
  {
    id: 'get-cms-maintainance-notifications-by-page',
    url: `${MOCK_BASE_PATH}/cms/storingsmeldingen/alle-meldingen-mijn-amsterdam/:page`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { page } = req.params;
            const response = structuredClone(DETAIL_RESPONSE);
            response.item.Url = `https://www.amsterdam.nl/storingsmeldingen/alle-meldingen-mijn-amsterdam/${page}/`;
            response.item.relUrl = `storingsmeldingen/alle-meldingen-mijn-amsterdam/${page}`;
            response.item.page.Lbl =
              page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ');
            return res.send(response);
          },
        },
      },
    ],
  },
  {
    id: 'get-cms-productenlijst',
    url: `${MOCK_BASE_PATH}/cms/mijn-content/artikelen/:articleslug/`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { articleslug } = req.params;
            if (articleslug === 'overzicht-producten-ondernemers') {
              const productenOndernemer = structuredClone(PRODUCTEN_OP_MA);
              productenOndernemer.applicatie.inhoud.inleiding =
                '<p><strong>Mock content voor BEDRIJVEN</strong></p>';
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
    url: `${MOCK_BASE_PATH}/cms/algemene_onderdelen/xxv/footer-xxv/`,
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

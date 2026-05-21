import maatschappelijkeactiviteitenEMZ from '../fixtures/hr-kvk/maatschappelijkeactiviteiten-eenmanszaak.json' with { type: 'json' };
import maatschappelijkeactiviteiten from '../fixtures/hr-kvk/maatschappelijkeactiviteiten.json' with { type: 'json' };
import vestigingen from '../fixtures/hr-kvk/vestigingen.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

function isCommercialUser(cacheKeySupplement?: string): boolean {
  return cacheKeySupplement === 'commercial';
}

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-kvk-maatschappelijkeactiviteiten',
    url: `${MOCK_BASE_PATH}/hr_kvk/maatschappelijkeactiviteiten`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const commercial = isCommercialUser(
              req.headers['x-cache-key-supplement'] as string | undefined
            );

            return res
              .status(200)
              .send(
                commercial
                  ? maatschappelijkeactiviteiten
                  : maatschappelijkeactiviteitenEMZ
              );
          },
        },
      },
    ],
  },
  {
    id: 'get-kvk-vestigingen',
    url: `${MOCK_BASE_PATH}/hr_kvk/vestigingen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const commercial = isCommercialUser(
              req.headers['x-cache-key-supplement'] as string | undefined
            );

            if (commercial) {
              return res.status(200).send(vestigingen);
            }

            return res.status(200).send({
              _embedded: {
                vestigingen: vestigingen._embedded.vestigingen.slice(0, 3),
              },
            });
          },
        },
      },
    ],
  },
];

import ERFPACHT_V2_DOSSIER_INFO_DETAILS from '../fixtures/erfpacht-v2-dossierinfo-bsn.json' with { type: 'json' };
import ERFPACHT_V2_DOSSIERS from '../fixtures/erfpacht-v2-dossiers.json' with { type: 'json' };
import ERFPACHT_V2_ERFPACHTER from '../fixtures/erfpacht-v2-erfpachter.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-erfpacht-v2-erfpachter',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/erfpachter`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_ERFPACHTER,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-v2-dossiers',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_DOSSIERS,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-v2-dossier-info-details',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo/:dossierId`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const dossierNummer = req.params.dossierId;
            return res.send({
              ...ERFPACHT_V2_DOSSIER_INFO_DETAILS,
              dossierNummer,
            });
          },
        },
      },
    ],
  },
];

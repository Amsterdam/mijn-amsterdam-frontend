import DOSSIER_INFO_DETAILS from '../fixtures/erfpacht-v2-dossierinfo-bsn.json' with { type: 'json' };
import DOSSIERS from '../fixtures/erfpacht-v2-dossiers.json' with { type: 'json' };
import ERFPACHTER from '../fixtures/erfpacht-v2-erfpachter.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
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
          body: ERFPACHTER,
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
          body: DOSSIERS,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-v2-dossier-info-details',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo/*`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: DOSSIER_INFO_DETAILS,
        },
      },
    ],
  },
];

import ERFPACHT_V2_DOSSIER_INFO_DETAILS from '../fixtures/erfpacht/erfpacht-v2-dossierinfo-bsn.json' with { type: 'json' };
import ERFPACHT_V2_DOSSIERS from '../fixtures/erfpacht/erfpacht-v2-dossiers.json' with { type: 'json' };
import ERFPACHT_V2_ERFPACHTER from '../fixtures/erfpacht/erfpacht-v2-erfpachter.json' with { type: 'json' };
import ERFPACHT_ZAAK_DETAIL from '../fixtures/erfpacht/erfpacht-zaak-detail.json' with { type: 'json' };
import ERFPACHT_ZAAK_INFO from '../fixtures/erfpacht/erfpacht-zaak-info.json' with { type: 'json' };
import ERFPACHT_ZAAK_STATUSSEN from '../fixtures/erfpacht/erfpacht-zaak-statussen.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-erfpacht-v2-erfpachter',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/erfpachter`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ERFPACHT_V2_ERFPACHTER,
    },
  },
  {
    id: 'get-erfpacht-v2-dossiers',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ERFPACHT_V2_DOSSIERS,
    },
  },
  {
    id: 'get-erfpacht-v2-dossier-info-details',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo/:dossierId`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const dossierNummer = req.params.dossierId;
        return res.send({
          ...ERFPACHT_V2_DOSSIER_INFO_DETAILS,
          dossierNummer,
        });
      },
    },
  },
  {
    id: 'get-erfpacht-zaakinfo',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/zaakinfo`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ERFPACHT_ZAAK_INFO,
    },
  },
  {
    id: 'get-erfpacht-zaak-detail',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/ozgv/zaak/:uuid`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ERFPACHT_ZAAK_DETAIL,
    },
  },
  {
    id: 'get-erfpacht-zaak-statussen',
    url: `${MOCK_BASE_PATH}/erfpachtv2/vernise/api/ozgv/statussen`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ERFPACHT_ZAAK_STATUSSEN,
    },
  },
];

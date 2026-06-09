const settings = require('../settings.cjs');

const ERFPACHT_V2_RESPONSES = {
  ERFPACHTER: require('../fixtures/erfpacht/erfpacht-v2-erfpachter.json'),
  DOSSIERS: require('../fixtures/erfpacht/erfpacht-v2-dossiers.json'),
  ZAAKINFO: require('../fixtures/erfpacht/erfpacht-zaakinfo.json'),
  DOSSIER_INFO_DETAILS: require('../fixtures/erfpacht/erfpacht-v2-dossierinfo-bsn.json'),
  ZAAK_DETAIL: require('../fixtures/erfpacht/erfpacht-zaak-detail.json'),
  ZAAK_STATUSSEN: require('../fixtures/erfpacht/erfpacht-zaak-statussen.json'),
};

module.exports = [
  {
    id: 'get-erfpacht-v2-erfpachter',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/erfpachter`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_RESPONSES.ERFPACHTER,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-v2-dossiers',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_RESPONSES.DOSSIERS,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-zaakinfo',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/zaakinfo`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_RESPONSES.ZAAKINFO,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-v2-dossier-info-details',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo/:dossierId`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware(req, res) {
            const dossierNummer = req.params.dossierId;
            return res.send({
              ...ERFPACHT_V2_RESPONSES.DOSSIER_INFO_DETAILS,
              dossierNummer,
            });
          },
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-zaak-detail',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/ozgv/zaak/:uuid`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_RESPONSES.ZAAK_DETAIL,
        },
      },
    ],
  },
  {
    id: 'get-erfpacht-zaak-statussen',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/ozgv/statussen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ERFPACHT_V2_RESPONSES.ZAAK_STATUSSEN,
        },
      },
    ],
  },
];

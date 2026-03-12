const settings = require('../settings');

const ERFPACHT_V2_RESPONSES = {
  ERFPACHTER: require('../fixtures/erfpacht-v2-erfpachter.json'),
  DOSSIERS: require('../fixtures/erfpacht-v2-dossiers.json'),
  DOSSIER_INFO_DETAILS: require('../fixtures/erfpacht-v2-dossierinfo-bsn.json'),
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
    id: 'get-erfpacht-v2-dossier-info-details',
    url: `${settings.MOCK_BASE_PATH}/erfpachtv2/vernise/api/dossierinfo/:dossierNummerUrlParam`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware(req, res) {
            const parts = req.params.dossierNummerUrlParam.split('.');
            const dossierNummer = `${parts[0]}${parts[1]}.${parts[2]}`;
            return res.send({
              ...ERFPACHT_V2_RESPONSES.DOSSIER_INFO_DETAILS,
              dossierNummer,
            });
          },
        },
      },
    ],
  },
];

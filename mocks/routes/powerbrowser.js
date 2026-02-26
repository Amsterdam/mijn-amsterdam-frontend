const BB_SEARCH_DOCUMENTS = require('../fixtures/powerbrowser-bb-attachments.json');
const BB_PERSONEN_ZAKEN = require('../fixtures/powerbrowser-bb-personen-zaken.json');
const BB_SEARCH_PERSON = require('../fixtures/powerbrowser-bb-search-person.json');
const BB_LINK_ZAAK_ADRES = require('../fixtures/powerbrowser-bb-zaak-adres.json');
const BB_ZAAK_STATUS = require('../fixtures/powerbrowser-bb-zaak-status.json');
const BB_ZAKEN = require('../fixtures/powerbrowser-bb-zaken.json');
const settings = require('../settings');

const BB_SEARCH_DOCUMENTS_PROCESSED = {
  mainTableName: BB_SEARCH_DOCUMENTS.mainTableName,
  records: BB_SEARCH_DOCUMENTS.records.map((record) => {
    const minimumValidRecord = [
      {
        fieldName: 'STAMCSSTATUS_ID',
        text: 'definitief',
        fieldValue: '1000001002',
      },
      {
        fieldName: 'OPENBAARHEID_ID',
        text: 'openbaar',
        fieldValue: '1000001001',
      },
      {
        fieldName: 'SOORTDOCUMENT_ID',
        fieldValue: record.fmtCpn.toLowerCase().includes('besluit')
          ? '256' // besluit
          : '1000001015', // aanvraag
      },
    ];
    return {
      ...record,
      fields: [...minimumValidRecord, ...record.fields],
    };
  }),
};

module.exports = [
  {
    id: 'post-powerbrowser-token',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'text',
        options: {
          status: 200,
          body: 'xxxx-909090-yyyy',
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-search-requests',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/SearchRequest`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            if (['MAATSCHAP', 'PERSONEN'].includes(req.body.query.tableName)) {
              return res.send(BB_SEARCH_PERSON);
            }
            return res.send({
              mainTableName: BB_SEARCH_DOCUMENTS_PROCESSED.mainTableName,
              records: BB_SEARCH_DOCUMENTS_PROCESSED.records.filter((record) =>
                req.body.query.conditions.some(
                  (condition) =>
                    condition.fieldName === 'GFO_ZAKEN_ID' &&
                    record.forTestingZaakIds?.includes(condition.fieldValue)
                )
              ),
            });
          },
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-zaak-status',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Report/RunSavedReport`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_ZAAK_STATUS,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-zaken',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/record/GFO_ZAKEN/:zaakIds`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, _, __) => {
            res.send(
              BB_ZAKEN.filter((zaak) =>
                req.params.zaakIds.split(',').includes(zaak.id)
              )
            );
          },
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-personen-zaken',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Link/:type/GFO_ZAKEN/Table`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_PERSONEN_ZAKEN,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-adres',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Link/GFO_ZAKEN/ADRESSEN/Table`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            return res.send(BB_LINK_ZAAK_ADRES);
          },
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-attachment-download',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Dms/:id/Pdf`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: settings.MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];

const ADDRESS_BOOKS = require('../fixtures/decos-vergunningen-addressbook-response.json');
const DOCUMENTS_LIST = require('../fixtures/decos-vergunningen-documents-list-response.json');
const TERMIJNENS = require('../fixtures/decos-vergunningen-termijnens-response.json');
const VARENS = require('../fixtures/decos-vergunningen-varens-response.json');
const WORKFLOW_INSTANCES = require('../fixtures/decos-vergunningen-workflowinstances-response.json');
const WORKFLOWS = require('../fixtures/decos-vergunningen-workflows-response.json');
const ZAKEN = require('../fixtures/decos-vergunningen-zaken-response.json');
const settings = require('../settings.js');

const zakenKeysStatusInBehandeling = ZAKEN.content
  .filter((zaak) => zaak.fields.title === 'In behandeling')
  .map((zaak) => zaak.key);

const getVarensBelongingToZaak = (zaak) =>
  VARENS.content?.find((v) => v.fields.mark === zaak?.fields?.varens) || null;

function getZaakByKey(key) {
  return ZAKEN.content.find((zaak) => zaak.key === key);
}

module.exports = [
  {
    id: 'post-decos-address-books',
    url: `${settings.MOCK_BASE_PATH}/decos/search/books`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ADDRESS_BOOKS,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-detail',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            // NOTE: Does not send same/full detailpage response as would be on TAP envs.
            return res.send(
              ZAKEN.content.find((zaak) => zaak.key === req.params.key) ?? null
            );
          },
        },
      },
    ],
  },
  {
    id: 'get-decos-zaken',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/folders`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZAKEN,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-documents',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/documents`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: DOCUMENTS_LIST,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-workflows',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/workflows`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            if (zakenKeysStatusInBehandeling.includes(req.params.key)) {
              WORKFLOWS.content[0].key = req.params.key;
              return res.send(WORKFLOWS);
            }
            return res.send({ content: [] });
          },
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-workflowdetails',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/workflowlinkinstances`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            if (zakenKeysStatusInBehandeling.includes(req.params.key)) {
              const queryParams = new URLSearchParams(req.query);
              const stepTitle = queryParams.get('filter').match(/'(.*?)'/g); //filter=text7 eq '${stepTitle}';

              WORKFLOW_INSTANCES.content[1].fields.text7 = stepTitle[0]
                .replaceAll("'", '')
                .trim();

              const dateRequest = new Date(
                getZaakByKey(req.params.key).fields.document_date
              );

              dateRequest.setDate(dateRequest.getDate() + 4);

              WORKFLOW_INSTANCES.content[1].fields.date1 =
                dateRequest.toISOString();

              return res.send(WORKFLOW_INSTANCES);
            }
            return res.send({ content: [] });
          },
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-termijnens',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/termijnens`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            if (zakenKeysStatusInBehandeling.includes(req.params.key)) {
              TERMIJNENS.content[0].key = req.params.key;
              return res.send(TERMIJNENS);
            }
            return res.send({ content: [] });
          },
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-varens',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/varens`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            const zaak = getZaakByKey(req.params.key);
            const vergunning = getVarensBelongingToZaak(zaak);
            if (vergunning) {
              return res.send({ content: [vergunning] });
            }
            return res.send({ content: [] });
          },
        },
      },
    ],
  },
  {
    id: 'get-decos-document-blob',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/blob`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            content: [
              {
                fields: {
                  bol10: true,
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'get-decos-document-download',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/content`,
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

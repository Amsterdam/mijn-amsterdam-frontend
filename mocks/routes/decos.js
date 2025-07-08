import ADDRESS_BOOKS from '../fixtures/decos-vergunningen-addressbook-response.json' with { type: 'json' };
import DOCUMENTS_LIST from '../fixtures/decos-vergunningen-documents-list-response.json' with { type: 'json' };
import TERMIJNENS from '../fixtures/decos-vergunningen-termijnens-response.json' with { type: 'json' };
import VAREN_RESPONSE from '../fixtures/decos-vergunningen-varens-response.json' with { type: 'json' };
import WORKFLOW_INSTANCES from '../fixtures/decos-vergunningen-workflowinstances-response.json' with { type: 'json' };
import WORKFLOWS from '../fixtures/decos-vergunningen-workflows-response.json' with { type: 'json' };
import ZAKEN from '../fixtures/decos-vergunningen-zaken-response.json' with { type: 'json' };
import { MOCK_BASE_PATH, MOCK_DOCUMENT_PATH } from '../settings.js';

const zakenKeysStatusInBehandeling = ZAKEN.content
  .filter((zaak) => zaak.fields.title === 'In behandeling')
  .map((zaak) => zaak.key);

const getVarensBelongingToZaak = (zaak) =>
  VAREN_RESPONSE.content?.find((v) => v.fields.mark === zaak?.fields?.varens) ||
  null;

function getZaakByKey(key) {
  return ZAKEN.content.find((zaak) => zaak.key === key);
}

export default [
  {
    id: 'post-decos-address-books',
    url: `${MOCK_BASE_PATH}/decos/search/books`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/folders`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/documents`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/workflows`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/workflowlinkinstances`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/termijnens`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/varens`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/blob`,
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
    url: `${MOCK_BASE_PATH}/decos/items/:key/content`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];

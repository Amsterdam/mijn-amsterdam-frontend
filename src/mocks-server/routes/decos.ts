import ADDRESS_BOOKS from '../fixtures/decos-vergunningen-addressbook-response.json' with { type: 'json' };
import DOCUMENTS_LIST from '../fixtures/decos-vergunningen-documents-list-response.json' with { type: 'json' };
import TERMIJNENS from '../fixtures/decos-vergunningen-termijnens-response.json' with { type: 'json' };
import VARENS from '../fixtures/decos-vergunningen-varens-response.json' with { type: 'json' };
import WORKFLOW_INSTANCES from '../fixtures/decos-vergunningen-workflowinstances-response.json' with { type: 'json' };
import WORKFLOWS from '../fixtures/decos-vergunningen-workflows-response.json' with { type: 'json' };
import ZAKEN from '../fixtures/decos-vergunningen-zaken-response.json' with { type: 'json' };
import { sendMockDocument } from '../helpers/send-mock-document.ts';
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

type Zaak = {
  key: string;
  fields: {
    title?: string;
    varens?: string[];
    document_date?: string;
    [key: string]: unknown;
  };
};

type Varen = {
  fields: {
    mark?: string;
    [key: string]: unknown;
  };
};

const zaken = ZAKEN as { content: Zaak[] };
const varensData = VARENS as { content: Varen[] };
const workflowsData = WORKFLOWS as { content: Array<Record<string, unknown>> };
const workflowInstancesData = WORKFLOW_INSTANCES as {
  content: Array<{ fields: Record<string, unknown> }>;
};
const termijnensData = TERMIJNENS as { content: Array<{ key?: string }> };
const addressBooksData = ADDRESS_BOOKS as {
  itemDataResultSet: { content: Array<{ key: string }> };
};

const zakenKeysStatusInBehandeling = zaken.content
  .filter((zaak) => zaak.fields.title === 'In behandeling')
  .map((zaak) => zaak.key);

function getVarensBelongingToZaak(zaak?: Zaak): Varen[] | null {
  if (!zaak?.fields?.varens) {
    return null;
  }

  return (
    varensData.content?.filter((varen) =>
      zaak.fields.varens?.includes(varen.fields.mark ?? '')
    ) ?? null
  );
}

function getZaakByKey(key: string): Zaak | undefined {
  return zaken.content.find((zaak) => zaak.key === key);
}

export const decosRoutes: MockRouteDefinition[] = [
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
          middleware: (req, res) => {
            return res.send(getZaakByKey(req.params.key) ?? null);
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
          middleware: (req, res) => {
            if (zakenKeysStatusInBehandeling.includes(req.params.key)) {
              workflowsData.content[0].key = req.params.key;
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
          middleware: (req, res) => {
            if (zakenKeysStatusInBehandeling.includes(req.params.key)) {
              const queryParams = new URLSearchParams(
                req.query as Record<string, string>
              );
              const filterValue = queryParams.get('filter') ?? '';
              const stepTitleMatch = filterValue.match(/'(.*?)'/g);

              if (stepTitleMatch?.[0]) {
                workflowInstancesData.content[1].fields.text7 =
                  stepTitleMatch[0].replaceAll("'", '').trim();
              }

              const dateSource = getZaakByKey(req.params.key)?.fields
                .document_date;
              if (dateSource) {
                const dateRequest = new Date(dateSource);
                dateRequest.setDate(dateRequest.getDate() + 4);
                workflowInstancesData.content[1].fields.date1 =
                  dateRequest.toISOString();
              }

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
          middleware: (req, res) => {
            if (zakenKeysStatusInBehandeling.includes(req.params.key)) {
              termijnensData.content[0].key = req.params.key;
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
          middleware: (req, res, _next, core) => {
            if (
              addressBooksData.itemDataResultSet.content.some(
                ({ key }) => key === req.params.key
              )
            ) {
              core.logger.debug(`direct varens request for ${req.params.key}`);
              return res.send({ content: varensData.content });
            }

            const zaak = getZaakByKey(req.params.key);
            const vergunningen = getVarensBelongingToZaak(zaak);
            if (vergunningen) {
              return res.send({ content: vergunningen });
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
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            sendMockDocument(res, 200);
          },
        },
      },
    ],
  },
];

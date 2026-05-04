import { fetchKlantcontact } from './klantcontact.ts';
import mockdate from 'mockdate';
import type {
  AfspraakResponseSource,
  AfspraakSource,
  ContactmomentResponseSource,
} from './klantcontact.types.ts';
import { remoteApiHost } from '../../../testing/setup.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

const baseAfspraak: AfspraakSource = {
  subject: 'Blauwe zone',
  status: 'New',
  startDate: '2026-02-26 09:00:00',
  qrCode: 'xxxxxxxxxxxxxxxxxxxx',
  products: [
    {
      name: 'Blauwe zone',
    },
  ],
  location: {
    street: null,
    postalCode: null,
    name: 'Zuidoost',
    countryCode: 'NL',
    city: null,
  },
  endDate: '2026-02-26 09:20:00',
  caseReference: '0',
  cancellationLink: `${remoteApiHost}/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
};

function setUpAPI(responses: {
  contactmomentenResponse: ContactmomentResponseSource;
  afsprakenResponse: AfspraakResponseSource;
}) {
  remoteApi
    .get(
      new RegExp(
        '/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/'
      )
    )
    .reply(200, responses.contactmomentenResponse);
  remoteApi
    .get(
      new RegExp(
        '/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/appointments'
      )
    )
    .reply(200, responses.afsprakenResponse);
}

const upcomingStartDate = '2025-01-01 09:00:00';
const upcomingEndDate = '2025-01-01 09:30:00';

const expiredStartDate = '2024-12-01 09:00:00';
const expiredEndDate = '2024-12-01 09:30:00';

beforeEach(() => {
  mockdate.set('2025-01-01');
});

const profileAndToken = getAuthProfileAndToken();

test('should transform the data correctly', async () => {
  setUpAPI({
    contactmomentenResponse: {
      results: [
        {
          plaatsgevondenOp: '2024-05-22 08:28:45',
          onderwerp: 'Algemeen',
          nummer: '10001875',
          kanaal: 'Telefoon',
        },
      ],
    },
    afsprakenResponse: {
      results: [
        {
          subject: 'Vaarvignet',
          status: 'New',
          startDate: upcomingStartDate,
          endDate: upcomingEndDate,
          qrCode: 'xxxxxxxxxxxxxxxxxxxx',
          products: [
            {
              name: 'Vaarvignet',
            },
          ],
          location: {
            street: null,
            postalCode: null,
            name: 'Zuidoost',
            countryCode: 'NL',
            city: null,
          },
          caseReference: '00157784',
          cancellationLink: `${remoteApiHost}/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
        },
      ],
      previous: null,
      next: null,
      count: 1,
    },
  });
  const result = await fetchKlantcontact(profileAndToken);
  expect(result.status).toBe('OK');
  expect(result.content.contactmomenten).toMatchInlineSnapshot(`
      [
        {
          "datePublished": "2024-05-22 08:28:45",
          "datePublishedFormatted": "22 mei 2024",
          "kanaal": "Telefoon",
          "referenceNumber": "10001875",
          "subject": "Algemeen",
        },
      ]
    `);
  expect(result.content.afspraken).toMatchInlineSnapshot(`
    [
      {
        "cancellationLink": "http://remote-api-host/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "caseReference": "00157784",
        "dateFormatted": "01 januari 2025",
        "endDate": "2025-01-01T09:30:00Z",
        "location": {
          "city": null,
          "countryCode": "NL",
          "name": "Zuidoost",
          "postalCode": null,
          "street": null,
        },
        "qrCode": "xxxxxxxxxxxxxxxxxxxx",
        "startDate": "2025-01-01T09:00:00Z",
        "status": "New",
        "subject": "Vaarvignet",
      },
    ]
  `);
});

test('Tranfers historical appointments to contactmomenten', async () => {
  setUpAPI({
    contactmomentenResponse: {
      results: [],
    },
    afsprakenResponse: {
      results: [
        {
          ...baseAfspraak,
          status: 'No show',
          caseReference: '1',
          startDate: expiredStartDate,
          endDate: expiredEndDate,
        },
        {
          ...baseAfspraak,
          status: 'NoShowCounter',
          caseReference: '2',
          startDate: expiredStartDate,
          endDate: expiredEndDate,
        },
      ],
      count: 5,
      next: null,
      previous: null,
    },
  });
  const result = await fetchKlantcontact(profileAndToken);
  expect(result.status).toBe('OK');
  expect(result.content.contactmomenten).toMatchInlineSnapshot(`
    [
      {
        "datePublished": "2024-12-01T09:00:00Z",
        "datePublishedFormatted": "01 december 2024",
        "kanaal": "Stadsloket",
        "referenceNumber": "1",
        "subject": "Gemiste afspraak",
      },
      {
        "datePublished": "2024-12-01T09:00:00Z",
        "datePublishedFormatted": "01 december 2024",
        "kanaal": "Stadsloket",
        "referenceNumber": "2",
        "subject": "Gemiste afspraak",
      },
    ]
  `);
  expect(result.content.afspraken).toStrictEqual([]);
});

test('Filters out afspraken that are already present as contactmomenten', async () => {
  setUpAPI({
    contactmomentenResponse: {
      results: [],
    },
    afsprakenResponse: {
      results: [
        {
          ...baseAfspraak,
          status: 'New',
          caseReference: '1',
          startDate: upcomingStartDate,
          endDate: upcomingEndDate,
        },
        {
          ...baseAfspraak,
          status: 'Completed',
          caseReference: '2',
          startDate: expiredStartDate,
          endDate: expiredEndDate,
        },
        {
          ...baseAfspraak,
          status: 'Cancelled',
          caseReference: '3',
          startDate: upcomingStartDate,
          endDate: upcomingEndDate,
        },
      ],
      count: 5,
      next: null,
      previous: null,
    },
  });
  const result = await fetchKlantcontact(profileAndToken);
  expect(result.status).toBe('OK');
  expect(
    result.content.afspraken.map((a) => {
      return { status: a.status };
    })
  ).toStrictEqual([{ status: 'New' }]);
});

import { fetchKlantcontact } from './klantcontact.ts';
import type {
  AfspraakResponseSource,
  ContactmomentResponseSource,
} from './klantcontact.types.ts';
import { remoteApiHost } from '../../../testing/setup.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

const contactmomentenResponse = {
  results: [
    {
      plaatsgevondenOp: '2024-05-22 08:28:45',
      onderwerp: 'Algemeen',
      nummer: '10001875',
      kanaal: 'Telefoon',
    },
    {
      plaatsgevondenOp: '2024-05-29 08:02:38',
      onderwerp: 'Meldingen',
      nummer: '00002032',
      kanaal: 'Telefoon',
    },
  ],
};

const afsprakenResponse: AfspraakResponseSource = {
  results: [
    {
      subject: 'Vaarvignet',
      status: 'Canceled',
      startDate: '2026-02-26 09:00:00',
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
      endDate: '2026-02-26 09:20:00',
      caseReference: '00157784',
      cancellationLink: `${remoteApiHost}/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
    },
  ],
  previous: null,
  next: null,
  count: 2,
};

const noShowAfspraak: AfspraakResponseSource['results'][0] = {
  subject: 'Blauwe zone',
  status: 'No show',
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
  caseReference: '00157783',
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

describe('Contactmomenten service', () => {
  const profileAndToken = getAuthProfileAndToken();

  test('should transform the data correctly', async () => {
    setUpAPI({
      contactmomentenResponse,
      afsprakenResponse,
    });
    const result = await fetchKlantcontact(profileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content.contactmomenten).toMatchInlineSnapshot(`
      [
        {
          "contacttype": "Telefoon",
          "datePublished": "2024-05-29 08:02:38",
          "datePublishedFormatted": "29 mei 2024",
          "referenceNumber": "00002032",
          "subject": "Meldingen",
        },
        {
          "contacttype": "Telefoon",
          "datePublished": "2024-05-22 08:28:45",
          "datePublishedFormatted": "22 mei 2024",
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
          "dateFormatted": "26 februari 2026",
          "endDate": "2026-02-26T09:20:00Z",
          "location": {
            "city": null,
            "countryCode": "NL",
            "name": "Zuidoost",
            "postalCode": null,
            "street": null,
          },
          "qrCode": "xxxxxxxxxxxxxxxxxxxx",
          "startDate": "2026-02-26T09:00:00Z",
          "status": "Canceled",
          "subject": "Vaarvignet",
        },
      ]
    `);
  });

  test("Tranfers 'missed afspraken' to contactmomenten", async () => {
    setUpAPI({
      contactmomentenResponse: {
        results: [],
      },
      afsprakenResponse: {
        results: [noShowAfspraak],
        count: 1,
        next: null,
        previous: null,
      },
    });
    const result = await fetchKlantcontact(profileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content.contactmomenten).toMatchInlineSnapshot(`
      [
        {
          "contacttype": "Stadsloket",
          "datePublished": "2026-02-26T09:00:00Z",
          "datePublishedFormatted": "26 februari 2026",
          "referenceNumber": "00157783",
          "subject": "Gemiste afspraak",
        },
      ]
    `);
    expect(result.content.afspraken).toStrictEqual([]);
  });
});

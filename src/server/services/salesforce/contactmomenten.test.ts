import { fetchContactmomenten } from './contactmomenten.ts';
import type {
  AppointmentResponseSource,
  KlantcontactResponseSource,
} from './contactmomenten.types.ts';
import { remoteApiHost } from '../../../testing/setup.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

const klantcontactenResponse = {
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

const appointmentsResponse: AppointmentResponseSource = {
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

const noShowAppointment: AppointmentResponseSource['results'][0] = {
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
  klantcontactenResponse: KlantcontactResponseSource;
  appointmentsResponse: AppointmentResponseSource;
}) {
  remoteApi
    .get(
      new RegExp(
        '/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/'
      )
    )
    .reply(200, responses.klantcontactenResponse);
  remoteApi
    .get(
      new RegExp(
        '/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/appointments'
      )
    )
    .reply(200, responses.appointmentsResponse);
}

describe('Contactmomenten service', () => {
  const profileAndToken = getAuthProfileAndToken();

  test('should transform the data correctly', async () => {
    setUpAPI({
      klantcontactenResponse,
      appointmentsResponse,
    });
    const result = await fetchContactmomenten(profileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content.klantcontacten).toMatchInlineSnapshot(`
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
    expect(result.content.appointments).toMatchInlineSnapshot(`
      [
        {
          "appointmentDate": "2026-02-26",
          "appointmentDateFormatted": "26 februari 2026",
          "cancellationLink": "http://remote-api-host/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
          "caseReference": "00157784",
          "endTime": "09:20",
          "location": {
            "city": null,
            "countryCode": "NL",
            "name": "Zuidoost",
            "postalCode": null,
            "street": null,
          },
          "qrCode": "xxxxxxxxxxxxxxxxxxxx",
          "startTime": "09:00",
          "status": "Canceled",
          "subject": "Vaarvignet",
        },
      ]
    `);
  });

  test("Tranfers 'missed appointments' to klantcontacten", async () => {
    setUpAPI({
      klantcontactenResponse: {
        results: [],
      },
      appointmentsResponse: {
        results: [noShowAppointment],
        count: 1,
        next: null,
        previous: null,
      },
    });
    const result = await fetchContactmomenten(profileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content.klantcontacten).toMatchInlineSnapshot(`
      [
        {
          "contacttype": "Stadsloket",
          "datePublished": "2026-02-26",
          "datePublishedFormatted": "26 februari 2026",
          "referenceNumber": "00157783",
          "subject": "Gemiste afspraak",
        },
      ]
    `);
    expect(result.content.appointments).toMatchInlineSnapshot(`[]`);
  });
});

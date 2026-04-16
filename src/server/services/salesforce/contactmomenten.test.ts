import { fetchContactmomenten } from './contactmomenten.ts';
import type { AppointmentResponseSource } from './contactmomenten.types.ts';
import { remoteApiHost } from '../../../testing/setup.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

const klantcontactResponse = {
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

const appointmentResponse: AppointmentResponseSource = {
  results: [
    {
      subject: 'Vaarvignet',
      status: 'No show',
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
      caseReference: '00157783',
      cancellationLink: `${remoteApiHost}/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
    },
  ],
  previous: null,
  next: null,
  count: 3,
};

describe('Contactmomenten service', () => {
  const profileAndToken = getAuthProfileAndToken();

  test('should transform the data correctly', async () => {
    remoteApi
      .get(/salesforce\/contactmomenten/)
      .reply(200, klantcontactResponse);
    remoteApi
      .get(
        new RegExp(
          '/salesforce/contactmomenten/services/apexrest/klantinteracties/v1.0/appointments'
        )
      )
      .reply(200, appointmentResponse);
    const result = await fetchContactmomenten(profileAndToken);

    expect(result.status).toBe('OK');
    expect(result.content.klantcontacten).toStrictEqual([
      {
        datePublished: '2024-05-29 08:02:38',
        datePublishedFormatted: '29 mei 2024',
        referenceNumber: '00002032',
        subject: 'Meldingen',
        themaKanaal: 'Telefoon',
      },
      {
        datePublished: '2024-05-22 08:28:45',
        datePublishedFormatted: '22 mei 2024',
        referenceNumber: '10001875',
        subject: 'Algemeen',
        themaKanaal: 'Telefoon',
      },
    ]);
    expect(result.content.appointments).toStrictEqual([
      {
        appointmentDate: '2026-02-26',
        appointmentDateFormatted: '26 februari 2026',
        startTime: '09:00',
        endTime: '09:20',
        subject: 'Vaarvignet',
        status: 'No show',
        qrCode: 'xxxxxxxxxxxxxxxxxxxx',
        location: {
          street: null,
          countryCode: 'NL',
          postalCode: null,
          name: 'Zuidoost',
          city: null,
        },
        cancellationLink: `${remoteApiHost}/tripleforms/directregelen/default.aspx?scenarioid=AfspraakAfzeggen&environmentid=evAmsterdam&guid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
      },
    ]);
  });
});

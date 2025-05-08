import { fetchContactmomenten } from './contactmomenten';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

const responseData = {
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

describe('Contactmomenten service', () => {
  const profileAndToken = getAuthProfileAndToken();

  it('should transform the data correctly', async () => {
    remoteApi.get(/salesforce\/contactmomenten/).reply(200, responseData);

    const result = await fetchContactmomenten(profileAndToken);
    expect(result.status).toBe('OK');
    expect(result.content).toEqual([
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
  });
});

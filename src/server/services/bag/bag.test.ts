import nock from 'nock';

import { fetchBAG } from './bag';
import type { Adres } from '../brp/brp-types';

const ADDRESS = {
  straatnaam: 'straatje',
  huisnummer: 25,
  woonplaatsNaam: 'Amsterdam',
} as unknown as Adres;

const bagAddress = {
  identificatie: '0363200012145295',
  huisnummer: 1,
  huisletter: null,
  huisnummertoevoeging: null,
  postcode: '1011PN',
  woonplaatsNaam: 'Amsterdam',
  adresseerbaarObjectPuntGeometrieWgs84: {
    type: 'Point',
    coordinates: [4.9001655, 52.3676456],
  },
};

// This is only a section of the mock data from the source.
export const BAG_MOCK_DATA = {
  _embedded: {
    adresseerbareobjecten: [bagAddress],
  },
};

export function setupNockResponse(reply: number, response?: object) {
  nock('https://api.data.amsterdam.nl')
    .get(/benkagg\/adresseerbareobjecten/)
    .reply(reply, response);
}

describe('BAG service', () => {
  setupNockResponse(200, BAG_MOCK_DATA);

  test('Bag api should reply correctly', async () => {
    const response = await fetchBAG(ADDRESS);

    expect(response).toStrictEqual({
      status: 'OK',
      content: {
        address: ADDRESS,
        bagAddress,
        mokum: false,
        bagNummeraanduidingId: '0363200012145295',
        latlng: {
          lat: 52.3676456,
          lng: 4.9001655,
        },
      },
    });
  });

  test('No data in response', async () => {
    setupNockResponse(200, {});
    const response = await fetchBAG(ADDRESS);
    expect(response).toStrictEqual({ status: 'OK', content: null });
  });
});

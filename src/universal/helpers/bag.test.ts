import { Adres } from '../types';
import { BAGSourceData } from '../types/bag';
import {
  extractAddress,
  getBagSearchAddress,
  getLatLonByAddress,
  isLocatedInWeesp,
} from './bag';

describe('getLatLonByAddress', () => {
  const weesp = 'Herengracht 23';
  const amsterdam = 'Herengracht 23-1';

  const response: BAGSourceData = {
    results: [
      {
        adres: 'Herengracht 23-1',
        centroid: [4.891968036478453, 52.37873183842775],
        woonplaats: 'Amsterdam',
        landelijk_id: 'xxx1',
      },
      {
        adres: 'Herengracht 23-2',
        centroid: [4.891968036478453, 52.37873183842775],
        woonplaats: 'Amsterdam',
        landelijk_id: 'xxx2',
      },
      {
        adres: 'Herengracht 23-H',
        centroid: [4.891968036478453, 52.37873183842775],
        woonplaats: 'Amsterdam',
        landelijk_id: 'xxx3',
      },
      {
        adres: 'Herengracht 23',
        centroid: [5.039817231849981, 52.30885683238395],
        woonplaats: 'Weesp',
        landelijk_id: 'xxx4',
      },
      {
        adres: 'Herengracht 231a',
        centroid: [5.03863916842061, 52.30886128545404],
        woonplaats: 'Weesp',
        landelijk_id: 'xxx5',
      },
      {
        adres: 'Nieuwe Herengracht 23-1',
        centroid: [4.902795334609859, 52.36631966746123],
        woonplaats: 'Amsterdam',
        landelijk_id: 'xxx6',
      },
    ],
  };

  test('Amsterdam', () => {
    expect(getLatLonByAddress(response?.results, amsterdam, false)).toEqual({
      lat: 52.37873183842775,
      lng: 4.891968036478453,
    });
  });

  test('Weesp', () => {
    expect(getLatLonByAddress(response?.results, weesp, true)).toEqual({
      lat: 52.30885683238395,
      lng: 5.039817231849981,
    });
  });

  test('extractAddress', () => {
    expect(extractAddress('Herengracht 23-1, 1015BA, Amsterdam _ ; ,')).toBe(
      'Herengracht 23-1'
    );

    expect(
      extractAddress('Burgemeester Röellstraat 44, 1015BA, Amsterdam _ ; ,')
    ).toBe('Burgemeester Röellstraat 44');
  });

  test('isWeesp', () => {
    expect(isLocatedInWeesp('Weesperstraat 113 Amsterdam')).toBe(false);
    expect(isLocatedInWeesp('Herengracht 23 Weesp')).toBe(true);

    // This is an exception. Currently no addresses including the word "amsterdam" exist in Weesp so for now this function is sufficient.
    expect(isLocatedInWeesp('Amsterdamse straatweg 999 Weesp')).toBe(false);
  });

  test('getBagSearchAddress', () => {
    expect(
      getBagSearchAddress({
        straatnaam: 'Herengracht',
        huisnummer: '23',
        huisletter: null,
        huisnummertoevoeging: null,
      } as Adres)
    ).toBe('Herengracht 23');

    expect(
      getBagSearchAddress({
        straatnaam: 'Herengracht',
        huisnummer: '23',
        huisletter: null,
        huisnummertoevoeging: '1',
      } as Adres)
    ).toBe('Herengracht 23-1');

    expect(
      getBagSearchAddress({
        straatnaam: 'Herengracht',
        huisnummer: '23',
        huisletter: null,
        huisnummertoevoeging: 'A',
      } as Adres)
    ).toBe('Herengracht 23-A');

    expect(
      getBagSearchAddress({
        straatnaam: 'Herengracht',
        huisnummer: '23',
        huisletter: 'C',
        huisnummertoevoeging: null,
      } as Adres)
    ).toBe('Herengracht 23C');

    expect(
      getBagSearchAddress({
        straatnaam: 'Herengracht',
        huisnummer: '23',
        huisletter: 'C',
        huisnummertoevoeging: '1',
      } as Adres)
    ).toBe('Herengracht 23C-1');
  });
});

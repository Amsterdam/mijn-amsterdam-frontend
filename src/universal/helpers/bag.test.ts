import {
  extractAddressParts,
  getLatLonByAddress,
  isLocatedInWeesp,
} from './bag.ts';
import {
  BAGQueryParams,
  BAGSourceData,
} from '../../server/services/bag/bag.types.ts';

describe('getLatLonByAddress', () => {
  const weesp: BAGQueryParams = {
    openbareruimteNaam: 'Herengracht',
    huisnummer: '23',
  };
  const amsterdam: BAGQueryParams = {
    openbareruimteNaam: 'Herengracht',
    huisnummer: '23',
    huisnummertoevoeging: '1',
  };

  const response: BAGSourceData = {
    _embedded: {
      adresseerbareobjecten: [
        {
          openbareruimteNaam: 'Herengracht',
          huisnummer: 23,
          huisletter: null,
          huisnummertoevoeging: '1',
          postcode: '1015BA',
          adresseerbaarObjectPuntGeometrieWgs84: {
            type: 'Point',
            coordinates: [5.0, 50.0],
          },
          woonplaatsNaam: 'Amsterdam',
          identificatie: 'xxx1',
        },
        {
          openbareruimteNaam: 'Herengracht',
          huisnummer: 23,
          huisletter: null,
          huisnummertoevoeging: '2',
          postcode: '1015BA',
          adresseerbaarObjectPuntGeometrieWgs84: {
            type: 'Point',
            coordinates: [6.0, 50.0],
          },
          woonplaatsNaam: 'Amsterdam',
          identificatie: 'xxx2',
        },
        {
          openbareruimteNaam: 'Herengracht',
          huisnummer: 23,
          huisletter: null,
          huisnummertoevoeging: 'H',
          postcode: '1015BA',
          adresseerbaarObjectPuntGeometrieWgs84: {
            type: 'Point',
            coordinates: [7.0, 50.0],
          },
          woonplaatsNaam: 'Amsterdam',
          identificatie: 'xxx3',
        },
        {
          openbareruimteNaam: 'Herengracht',
          huisnummer: 23,
          huisletter: null,
          huisnummertoevoeging: null,
          postcode: '1015BA',
          adresseerbaarObjectPuntGeometrieWgs84: {
            type: 'Point',
            coordinates: [8.0, 50.0],
          },
          woonplaatsNaam: 'Weesp',
          identificatie: 'xxx4',
        },
        {
          openbareruimteNaam: 'Herengracht',
          huisnummer: 231,
          huisletter: null,
          huisnummertoevoeging: 'a',
          postcode: '1015BA',
          adresseerbaarObjectPuntGeometrieWgs84: {
            type: 'Point',
            coordinates: [9.0, 50.0],
          },
          woonplaatsNaam: 'Weesp',
          identificatie: 'xxx5',
        },
        {
          openbareruimteNaam: 'Nieuwe Herengracht',
          huisnummer: 23,
          huisletter: null,
          huisnummertoevoeging: '1',
          postcode: '1015BA',
          adresseerbaarObjectPuntGeometrieWgs84: {
            type: 'Point',
            coordinates: [10.0, 50.0],
          },
          woonplaatsNaam: 'Amsterdam',
          identificatie: 'xxx6',
        },
      ],
    },
  };

  test('Found match in Amsterdam', () => {
    expect(
      getLatLonByAddress(
        response._embedded.adresseerbareobjecten,
        amsterdam,
        false
      )
    ).toEqual({
      address: 'Herengracht 23-1',
      lat: 50.0,
      lng: 5.0,
    });
  });

  test('Found match in Weesp', () => {
    expect(
      getLatLonByAddress(response._embedded.adresseerbareobjecten, weesp, true)
    ).toEqual({
      address: 'Herengracht 23',
      lat: 50.0,
      lng: 8.0,
    });
  });

  describe('extractAddressParts tests', () => {
    test('Extracts postal code at the beginning or end', () => {
      const expected: BAGQueryParams = {
        openbareruimteNaam: 'PATER V/D ELSENPLEIN',
        huisnummer: '86',
        postcode: '1023EH',
      };
      expect(
        extractAddressParts('1023EH PATER V/D ELSENPLEIN 86')
      ).toStrictEqual(expected);
      expect(
        extractAddressParts('PATER V/D ELSENPLEIN 86 1023 EH')
      ).toStrictEqual(expected);
    });

    test.each<[string, BAGQueryParams]>([
      [
        'Amstel 1',
        {
          openbareruimteNaam: 'Amstel',
          huisnummer: '1',
        },
      ],
      [
        'Burgemeester Röellstraat 44',
        {
          openbareruimteNaam: 'Burgemeester Röellstraat',
          huisnummer: '44',
        },
      ],
      [
        'NDSM-straat 1',
        {
          openbareruimteNaam: 'NDSM-straat',
          huisnummer: '1',
        },
      ],
      [
        '2e Kekerstraat 1',
        {
          openbareruimteNaam: '2e Kekerstraat',
          huisnummer: '1',
        },
      ],
      [
        'Herengracht 23-1,',
        {
          openbareruimteNaam: 'Herengracht',
          huisnummer: '23',
        },
      ],
      [
        'Insulindeweg 26A',
        {
          openbareruimteNaam: 'Insulindeweg',
          huisnummer: '26',
        },
      ],
      [
        "'t Dijkhuis 40",
        {
          openbareruimteNaam: "'t Dijkhuis",
          huisnummer: '40',
        },
      ],
      [
        'PATER V/D ELSENPLEIN 86',
        {
          openbareruimteNaam: 'PATER V/D ELSENPLEIN',
          huisnummer: '86',
        },
      ],
      [
        'P/A ST. JACOBSLAAN 339',
        {
          openbareruimteNaam: 'P/A ST. JACOBSLAAN',
          huisnummer: '339',
        },
      ],
      [
        'Amsterdam Rijnkanaalkade 1',
        {
          openbareruimteNaam: 'Amsterdam Rijnkanaalkade',
          huisnummer: '1',
        },
      ],
      [
        '1023EH 23',
        {
          postcode: '1023EH',
          huisnummer: '23',
        },
      ],
      [
        '1023 EH 5',
        {
          postcode: '1023EH',
          huisnummer: '5',
        },
      ],
    ])('Address: "%s"', (input, expected) => {
      expect(extractAddressParts(input)).toStrictEqual(expected);
    });

    test('Ignores city name and random characters', () => {
      const expected: BAGQueryParams = {
        openbareruimteNaam: 'Straatnaam',
        huisnummer: '1',
      };
      expect(
        extractAddressParts('Straatnaam 1, , Amsterdam _ ; ,')
      ).toStrictEqual(expected);
    });

    test('More then one "Amsterdam" in input', () => {
      const expected: BAGQueryParams = {
        openbareruimteNaam: 'Straatnaam',
        huisnummer: '1',
      };
      expect(
        extractAddressParts('Straatnaam 1 Amsterdam Amsterdam amsterdam')
      ).toStrictEqual(expected);
    });

    test('Whitespace is trimmed', () => {
      const expected: BAGQueryParams = {
        openbareruimteNaam: 'Straatnaam',
        huisnummer: '1',
      };
      expect(extractAddressParts('   Straatnaam 1   ')).toStrictEqual(expected);
    });

    test('Extra whitespace in between is removed', () => {
      const expected: BAGQueryParams = {
        openbareruimteNaam: 'Straatnaam',
        huisnummer: '1',
        postcode: '1023EH',
      };
      expect(extractAddressParts('Straatnaam  1 1023   EH')).toStrictEqual(
        expected
      );
    });
  });

  test('Adres is located in Weesp', () => {
    expect(isLocatedInWeesp('Weesperstraat 113 Amsterdam')).toBe(false);
    expect(isLocatedInWeesp('Herengracht 23 Weesp')).toBe(true);

    // This is an exception. Currently no addresses including the word "amsterdam" exist in Weesp so for now this function is sufficient.
    expect(isLocatedInWeesp('Amsterdamse straatweg 999 Weesp')).toBe(false);
  });
});

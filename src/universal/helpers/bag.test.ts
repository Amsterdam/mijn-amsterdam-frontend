import { extractAddress, getLatLonByAddress, isLocatedInWeesp } from './bag';
import { BAGQueryParams, BAGSourceData } from '../types/bag';

describe('getLatLonByAddress', () => {
  const weesp: BAGQueryParams = {
    openbareruimteNaam: 'Herengracht',
    huisnummer: 23,
  };
  const amsterdam: BAGQueryParams = {
    openbareruimteNaam: 'Herengracht',
    huisnummer: 23,
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

  describe('extractAddress tests', () => {
    test('Throws with bad input', () => {
      expect(() => extractAddress('')).toThrow();
    });

    test('Just streetname', () => {
      expect(extractAddress('Amstel')).toStrictEqual({
        openbareruimteNaam: 'Amstel',
      });
    });

    test('Extracts just postal code', () => {
      const expected = {
        postcode: '1023EH',
      };
      expect(extractAddress('1023EH')).toStrictEqual(expected);
      expect(extractAddress('1023 EH')).toStrictEqual(expected);
    });

    test('Extracts when postal code at the beginning or end', () => {
      const expected = {
        openbareruimteNaam: 'PATER V/D ELSENPLEIN',
        huisnummer: 86,
        postcode: '1023EH',
      };
      expect(extractAddress('1023EH PATER V/D ELSENPLEIN 86')).toStrictEqual(
        expected
      );
      expect(extractAddress('PATER V/D ELSENPLEIN 86 1023 EH')).toStrictEqual(
        expected
      );
    });

    test('Short streetname with single digit', () => {
      expect(extractAddress('Amstel 1')).toStrictEqual({
        openbareruimteNaam: 'Amstel',
        huisnummer: 1,
      });
    });

    test('Long streetname with latin character', () => {
      expect(extractAddress('Burgemeester Röellstraat 44')).toStrictEqual({
        openbareruimteNaam: 'Burgemeester Röellstraat',
        huisnummer: 44,
      });
    });

    test('Handles streetnames with a "-"', () => {
      expect(extractAddress('NDSM-straat 1')).toStrictEqual({
        openbareruimteNaam: 'NDSM-straat',
        huisnummer: 1,
      });
    });

    test('Streetname with leading number', () => {
      expect(extractAddress('2e Kekerstraat 1')).toStrictEqual({
        openbareruimteNaam: '2e Kekerstraat',
        huisnummer: 1,
      });
    });

    test('huisnummertoevoeging extracted', () => {
      expect(extractAddress('Herengracht 23-1')).toStrictEqual({
        openbareruimteNaam: 'Herengracht',
        huisnummer: 23,
        huisnummertoevoeging: '1',
      });
    });

    test('huisnummertoevoeging extracted with trailing comma', () => {
      expect(extractAddress('Herengracht 23-1,')).toStrictEqual({
        openbareruimteNaam: 'Herengracht',
        huisnummer: 23,
        huisnummertoevoeging: '1',
      });
    });

    test('Letter extracted as toevoeging', () => {
      expect(extractAddress('Insulindeweg 26A')).toStrictEqual({
        openbareruimteNaam: 'Insulindeweg',
        huisnummer: 26,
        huisnummertoevoeging: 'A',
      });
    });

    test('With leading apostrophe', () => {
      expect(extractAddress("'t Dijkhuis 40")).toStrictEqual({
        openbareruimteNaam: "'t Dijkhuis",
        huisnummer: 40,
      });
    });

    test('With a slash in the address', () => {
      expect(extractAddress('PATER V/D ELSENPLEIN 86')).toStrictEqual({
        openbareruimteNaam: 'PATER V/D ELSENPLEIN',
        huisnummer: 86,
      });
    });

    test('With a dot in the address', () => {
      expect(extractAddress('P/A ST. JACOBSLAAN 339')).toStrictEqual({
        openbareruimteNaam: 'P/A ST. JACOBSLAAN',
        huisnummer: 339,
      });
    });

    test('Ignores city name and random charcters', () => {
      expect(extractAddress('Straatnaam 1, , Amsterdam _ ; ,')).toStrictEqual({
        openbareruimteNaam: 'Straatnaam',
        huisnummer: 1,
      });
    });

    test('More then one "Amsterdam" in input', () => {
      expect(
        extractAddress('Straatnaam 1 Amsterdam Amsterdam amsterdam')
      ).toStrictEqual({
        openbareruimteNaam: 'Straatnaam',
        huisnummer: 1,
      });
    });

    test('Whitespace is trimmed', () => {
      expect(extractAddress('   Straatnaam 1   ')).toStrictEqual({
        openbareruimteNaam: 'Straatnaam',
        huisnummer: 1,
      });
    });

    test('Extra whitespace in between is removed', () => {
      expect(extractAddress('Straatnaam  1 1023   EH')).toStrictEqual({
        openbareruimteNaam: 'Straatnaam',
        huisnummer: 1,
        postcode: '1023EH',
      });
    });
  });

  test('Adres is located in Weesp', () => {
    expect(isLocatedInWeesp('Weesperstraat 113 Amsterdam')).toBe(false);
    expect(isLocatedInWeesp('Herengracht 23 Weesp')).toBe(true);

    // This is an exception. Currently no addresses including the word "amsterdam" exist in Weesp so for now this function is sufficient.
    expect(isLocatedInWeesp('Amsterdamse straatweg 999 Weesp')).toBe(false);
  });
});

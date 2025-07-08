import { describe, expect } from 'vitest';

import { formatKvkProfileData } from './ProfileCommercial.transform.tsx';
import type {
  KVKData,
  KVKSourceDataContent,
} from '../../../../../server/services/profile/kvk.ts';

describe('formatKvkProfileData', () => {
  test('should not format data when no kvkData is provided', () => {
    const kvkData = null;

    expect(() =>
      formatKvkProfileData(kvkData as unknown as KVKSourceDataContent)
    ).toThrowError();
  });

  test('should format onderneming data correctly', () => {
    const kvkData = {
      onderneming: {
        handelsnaam: 'Test Handelsnaam',
        handelsnamen: ['Handelsnaam 1', 'Handelsnaam 2'],
        rechtsvorm: 'BV',
        hoofdactiviteit: 'Softwareontwikkeling',
        overigeActiviteiten: ['Consultancy', 'Onderhoud'],
        datumAanvang: '2021-01-01',
        datumEinde: '2022-01-01',
        kvkNummer: '12345678',
      },
    } as unknown as KVKData;

    const result = formatKvkProfileData(kvkData);

    expect(result.onderneming).toMatchInlineSnapshot(`
      {
        "Activiteiten": "Softwareontwikkeling",
        "Einddatum onderneming": "01 januari 2022",
        "Handelsnaam": "Test Handelsnaam",
        "KVK nummer": "12345678",
        "Overige activiteiten": [
          <span>
            Consultancy
            <br />
          </span>,
          <span>
            Onderhoud
            <br />
          </span>,
        ],
        "Overige handelsnamen": [
          <span>
            Handelsnaam 1
            <br />
          </span>,
          <span>
            Handelsnaam 2
            <br />
          </span>,
        ],
        "Rechtsvorm": "BV",
        "Startdatum onderneming": "01 januari 2021",
      }
    `);
  });

  test('should format eigenaar data correctly', () => {
    const kvkData = {
      eigenaar: {
        naam: 'John Doe',
        geboortedatum: '1980-01-01',
        bsn: '123456789',
        adres: {
          straatnaam: 'Teststraat',
          huisnummer: '1',
          postcode: '1234AB',
          woonplaatsNaam: 'Amsterdam',
        },
      },
    } as unknown as KVKData;

    const result = formatKvkProfileData(kvkData);

    expect(result.eigenaar).toMatchObject({
      Adres: 'Teststraat 1',
      BSN: '123456789',
      Geboortedatum: '01 januari 1980',
      Naam: 'John Doe',
      Woonplaats: '1234AB Amsterdam',
    });
  });

  test('should handle empty kvkData', () => {
    const kvkData = {} as unknown as KVKData;

    const result = formatKvkProfileData(kvkData);

    expect(result.onderneming).toBeUndefined();
    expect(result.eigenaar).toBeUndefined();
  });

  test('should format rechtspersonen data correctly', () => {
    const kvkData = {
      rechtspersonen: [
        {
          rsin: '123456789',
          kvkNummer: '987654321',
          statutaireNaam: 'Test BV',
          statutaireZetel: 'Amsterdam',
        },
      ],
    } as unknown as KVKData;

    const result = formatKvkProfileData(kvkData);

    expect(result.rechtspersonen).toEqual([
      {
        KVKnummer: '987654321',
        RSIN: '123456789',
        'Statutaire naam': 'Test BV',
        'Statutaire zetel': 'Amsterdam',
      },
    ]);
  });
});

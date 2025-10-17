import { describe, expect, it } from 'vitest';

import { ZaakVergunningExploitatieWijzigingVergunningshouderType } from './config-and-types';
import { ZaakVergunningExploitatieWijzigingVergunningshouder } from './decos-zaken';
import { DecosZaakSource } from '../decos/decos-types';

describe('decosZaken', () => {
  describe('ZaakVergunningExploitatieWijzigingVergunningshouder afterTransform', () => {
    const createZaak = (zaak: unknown) =>
      zaak as ZaakVergunningExploitatieWijzigingVergunningshouderType;
    const afterTransform = (zaak: unknown) =>
      ZaakVergunningExploitatieWijzigingVergunningshouder.afterTransform!(
        createZaak(zaak),
        {} as DecosZaakSource
      );

    it.each([
      [
        'all values',
        [
          {
            identifier: 'NT2025-000001-1-00002',
            dateStart: '2025-01-02T00:00:00',
          },
          {
            identifier: 'NT2025-000001-1-00001',
            dateStart: '2025-01-01T00:00:00',
          },
        ],
      ],
      [
        'all values inverted',
        [
          {
            identifier: 'NT2025-000001-1-00001',
            dateStart: '2025-01-01T00:00:00',
          },
          {
            identifier: 'NT2025-000001-1-00002',
            dateStart: '2025-01-02T00:00:00',
          },
        ],
      ],
      [
        'only identifier',
        [
          {
            identifier: 'NT2025-000001-1-00002',
          },
          {
            identifier: 'NT2025-000001-1-00001',
          },
        ],
      ],
      [
        'only identifier inverted',
        [
          {
            identifier: 'NT2025-000001-1-00001',
          },
          {
            identifier: 'NT2025-000001-1-00002',
          },
        ],
      ],
      [
        'dateStart equals null',
        [
          {
            dateStart: null,
            identifier: 'NT2025-000001-1-00001',
          },
          {
            dateStart: null,
            identifier: 'NT2025-000001-1-00002',
          },
        ],
      ],
    ])(
      'should sort vergunningen correctly with %s',
      async (_title, vergunningen) => {
        const zaak = await afterTransform({
          vergunningen,
        });
        expect(zaak.vergunningen).toHaveLength(1);
        expect(zaak.vergunningen[0].identifier).toBe('NT2025-000001-1-00001');
      }
    );
  });
});

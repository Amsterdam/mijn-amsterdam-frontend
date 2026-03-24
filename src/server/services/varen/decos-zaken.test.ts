import { describe, expect, it } from 'vitest';

import type { ZaakVergunningExploitatieWijzigingVergunningshouderType } from './config-and-types.ts';
import { ZaakVergunningExploitatieWijzigingVergunningshouder } from './decos-zaken.ts';
import type { DecosZaakSource } from '../decos/decos-types.ts';

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
        'With dateStart',
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
        'with dateStart inverted',
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
        'Without dates',
        [
          {
            identifier: 'NT2025-000001-1-00002',
          },
          {
            identifier: 'NT2025-000001-1-00001',
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

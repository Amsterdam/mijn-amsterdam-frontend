import mockdate from 'mockdate';
import { describe, it, expect } from 'vitest';

import {
  generateApiUrl,
  getEMandateValidityDate,
  getFirstOpenTermijnFactuurDateFormatted,
  isFactuurInTermijnen,
} from './Afis-helpers.ts';
import {
  EMANDATE_ENDDATE_INDICATOR,
  type AfisFactuurFrontend,
} from './Afis-thema-config.ts';
import type {
  AfisEMandateFrontend,
  AfisFactuurTermijn,
} from '../../../../../../server/services/afis/afis-types.ts';

function createTermijn(
  overrides: Partial<AfisFactuurTermijn> = {}
): AfisFactuurTermijn {
  return {
    paymentDueDate: '2025-12-01T00:00:00',
    paymentDueDateFormatted: '1 december 2025',
    paymentStatus: 'open',
    debtClearingDate: null,
    debtClearingDateFormatted: null,
    amountOriginal: '100.00',
    amountOriginalFormatted: '100,00',
    term: 'B001',
    statusDescription: 'Open',
    ...overrides,
  };
}

function createFactuur(overrides: {
  status?: AfisFactuurFrontend['status'];
  termijnen?: AfisFactuurTermijn[];
}): AfisFactuurFrontend {
  return {
    paymentDueDateFormatted: '3 november 2025',
    ...overrides,
  } as AfisFactuurFrontend;
}

describe('Afis-helpers', () => {
  describe('generateApiUrl', () => {
    it('should generate a valid API URL when businessPartnerIdEncrypted is provided', () => {
      const businessPartnerIdEncrypted = 'encrypted-id';
      const route = 'AFIS_BUSINESSPARTNER' as const;

      const result = generateApiUrl(businessPartnerIdEncrypted, route);

      expect(result).toBe(
        'http://bff-api-host/services/afis/businesspartner?id=encrypted-id'
      );
    });

    it('should return null when businessPartnerIdEncrypted is null', () => {
      const businessPartnerIdEncrypted = null;
      const route = 'AFIS_BUSINESSPARTNER' as const;

      const result = generateApiUrl(businessPartnerIdEncrypted, route);

      expect(result).toBeNull();
    });
  });

  describe('getEMandateValidityDate', () => {
    beforeAll(() => {
      mockdate.set(new Date('2024-06-15'));
    });

    afterAll(() => {
      mockdate.reset();
    });

    it('should return the current date plus one year if dateValidTo includes the end date indicator', () => {
      const eMandate = {
        dateValidTo: `${EMANDATE_ENDDATE_INDICATOR}-12-31`,
      } as AfisEMandateFrontend;

      const result = getEMandateValidityDate(eMandate);

      const expectedDate = '2024-12-31';
      expect(result).toBe(expectedDate);
    });

    it('should return the current date plus one year if dateValidTo is null or undefined', () => {
      const eMandate = {
        dateValidTo: null,
      } as AfisEMandateFrontend;

      const result = getEMandateValidityDate(eMandate);

      const expectedDate = '2024-12-31';
      expect(result).toBe(expectedDate);
    });

    it('should return the original dateValidTo if it does not include the end date indicator', () => {
      const eMandate = {
        dateValidTo: '2025-11-10',
      } as AfisEMandateFrontend;

      const result = getEMandateValidityDate(eMandate);

      expect(result).toBe('2025-11-10');
    });

    describe('isFactuurInTermijnen', () => {
      it('should return true when the status is factuur-in-termijnen', () => {
        const factuur = createFactuur({ status: 'factuur-in-termijnen' });

        expect(isFactuurInTermijnen(factuur)).toBe(true);
      });

      it('should return false for any other status', () => {
        const factuur = createFactuur({ status: 'openstaand' });

        expect(isFactuurInTermijnen(factuur)).toBe(false);
      });
    });

    describe('getFirstOpenTermijnFactuurDateFormatted', () => {
      it('should return the factuur date when there are no termijnen', () => {
        const factuur = createFactuur({ termijnen: undefined });

        expect(getFirstOpenTermijnFactuurDateFormatted(factuur)).toBe(
          '3 november 2025'
        );
      });

      it('should return the factuur date when termijnen is an empty array', () => {
        const factuur = createFactuur({ termijnen: [] });

        expect(getFirstOpenTermijnFactuurDateFormatted(factuur)).toBe(
          '3 november 2025'
        );
      });

      it('should return the factuur date when all termijnen are already collected', () => {
        const factuur = createFactuur({
          termijnen: [
            createTermijn({ debtClearingDate: '2025-10-01T00:00:00' }),
            createTermijn({ debtClearingDate: '2025-11-03T00:00:00' }),
          ],
        });

        expect(getFirstOpenTermijnFactuurDateFormatted(factuur)).toBe(
          '3 november 2025'
        );
      });

      it('should return the date of the only open termijn', () => {
        const factuur = createFactuur({
          termijnen: [
            createTermijn({
              paymentDueDate: '2025-10-01T00:00:00',
              paymentDueDateFormatted: '1 oktober 2025',
              debtClearingDate: '2025-10-01T00:00:00',
            }),
            createTermijn({
              paymentDueDate: '2025-12-01T00:00:00',
              paymentDueDateFormatted: '1 december 2025',
            }),
          ],
        });

        expect(getFirstOpenTermijnFactuurDateFormatted(factuur)).toBe(
          '1 december 2025'
        );
      });

      it('should return the earliest due date of the open termijnen, regardless of order', () => {
        const factuur = createFactuur({
          termijnen: [
            createTermijn({
              paymentDueDate: '2026-02-01T00:00:00',
              paymentDueDateFormatted: '1 februari 2026',
            }),
            createTermijn({
              paymentDueDate: '2025-12-01T00:00:00',
              paymentDueDateFormatted: '1 december 2025',
            }),
            createTermijn({
              paymentDueDate: '2026-01-01T00:00:00',
              paymentDueDateFormatted: '1 januari 2026',
            }),
          ],
        });

        expect(getFirstOpenTermijnFactuurDateFormatted(factuur)).toBe(
          '1 december 2025'
        );
      });

      it('should ignore collected termijnen that are due earlier than the open ones', () => {
        const factuur = createFactuur({
          termijnen: [
            createTermijn({
              paymentDueDate: '2025-10-01T00:00:00',
              paymentDueDateFormatted: '1 oktober 2025',
              debtClearingDate: '2025-10-01T00:00:00',
            }),
            createTermijn({
              paymentDueDate: '2026-01-01T00:00:00',
              paymentDueDateFormatted: '1 januari 2026',
            }),
          ],
        });

        expect(getFirstOpenTermijnFactuurDateFormatted(factuur)).toBe(
          '1 januari 2026'
        );
      });

      it('should not mutate the original termijnen order', () => {
        const termijnen = [
          createTermijn({
            paymentDueDate: '2026-01-01T00:00:00',
            paymentDueDateFormatted: '1 januari 2026',
          }),
          createTermijn({
            paymentDueDate: '2025-12-01T00:00:00',
            paymentDueDateFormatted: '1 december 2025',
          }),
        ];
        const factuur = createFactuur({ termijnen });

        getFirstOpenTermijnFactuurDateFormatted(factuur);

        expect(factuur.termijnen?.[0].paymentDueDateFormatted).toBe(
          '1 januari 2026'
        );
      });
    });
  });
});

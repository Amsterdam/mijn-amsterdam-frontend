import { addYears } from 'date-fns';
import { describe, it, expect } from 'vitest';

import { generateApiUrl, getEMandateValidityDate } from './Afis-helpers';
import { EMANDATE_ENDDATE_INDICATOR } from './Afis-thema-config';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { BFFApiUrls } from '../../../config/api';

describe('Afis-helpers', () => {
  describe('generateApiUrl', () => {
    it('should generate a valid API URL when businessPartnerIdEncrypted is provided', () => {
      const businessPartnerIdEncrypted = 'encrypted-id';
      const route = 'AFIS_BUSINESSPARTNER' as keyof typeof BFFApiUrls;

      const result = generateApiUrl(businessPartnerIdEncrypted, route);

      expect(result).toBe(
        'http://bff-api-host/services/afis/businesspartner?id=encrypted-id'
      );
    });

    it('should return null when businessPartnerIdEncrypted is null', () => {
      const businessPartnerIdEncrypted = null;
      const route = 'AFIS_BUSINESSPARTNER' as keyof typeof BFFApiUrls;

      const result = generateApiUrl(businessPartnerIdEncrypted, route);

      expect(result).toBeNull();
    });
  });

  describe('getEMandateValidityDate', () => {
    it('should return the current date plus one year if dateValidTo includes the end date indicator', () => {
      const eMandate = {
        dateValidTo: `${EMANDATE_ENDDATE_INDICATOR}-12-31`,
      } as AfisEMandateFrontend;

      const result = getEMandateValidityDate(eMandate);

      const expectedDate = addYears(new Date(), 1).toISOString().split('T')[0];
      expect(result).toBe(expectedDate);
    });

    it('should return the current date plus one year if dateValidTo is null or undefined', () => {
      const eMandate = {
        dateValidTo: null,
      } as AfisEMandateFrontend;

      const result = getEMandateValidityDate(eMandate);

      const expectedDate = addYears(new Date(), 1).toISOString().split('T')[0];
      expect(result).toBe(expectedDate);
    });

    it('should return the original dateValidTo if it does not include the end date indicator', () => {
      const eMandate = {
        dateValidTo: '2025-11-10',
      } as AfisEMandateFrontend;

      const result = getEMandateValidityDate(eMandate);

      expect(result).toBe('2025-11-10');
    });
  });
});

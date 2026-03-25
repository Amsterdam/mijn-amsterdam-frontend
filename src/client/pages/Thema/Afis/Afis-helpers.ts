import { addYears } from 'date-fns';

import { EMANDATE_ENDDATE_INDICATOR } from './Afis-thema-config.ts';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types.ts';
import type { BFFApiUrls } from '../../../config/api.ts';
import { generateBffApiUrlWithEncryptedPayloadQuery } from '../../../helpers/api.ts';

export function generateApiUrl(
  businessPartnerIdEncrypted: string | null,
  route: keyof typeof BFFApiUrls
) {
  return businessPartnerIdEncrypted
    ? generateBffApiUrlWithEncryptedPayloadQuery(
        route,
        businessPartnerIdEncrypted,
        undefined,
        'id'
      )
    : null;
}

export function getEMandateValidityDate(eMandate: AfisEMandateFrontend) {
  let dateValidTo;
  if (
    eMandate.dateValidTo?.includes(EMANDATE_ENDDATE_INDICATOR) ||
    !eMandate.dateValidTo
  ) {
    dateValidTo = addYears(new Date(), 1).toISOString().split('T')[0];
  } else {
    dateValidTo = eMandate.dateValidTo;
  }
  return dateValidTo;
}

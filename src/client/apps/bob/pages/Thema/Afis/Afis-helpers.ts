import {
  EMANDATE_ENDDATE_INDICATOR,
  type AfisFactuurFrontend,
} from './Afis-thema-config.ts';
import type { AfisEMandateFrontend } from '../../../../../../server/services/afis/afis-types.ts';
import { displayAmount } from '../../../../../../universal/helpers/text.ts';
import { generateBffApiUrlWithEncryptedPayloadQuery } from '../../../../../helpers/api.ts';
import type { BFFApiUrls } from '../../../config/api.ts';

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
    dateValidTo = `${new Date().getFullYear()}-12-31`;
  } else {
    dateValidTo = eMandate.dateValidTo;
  }
  return dateValidTo;
}

export function getOpenstaandBedragFormatted(
  factuur: AfisFactuurFrontend
): string {
  if (!factuur.termijnen?.length) {
    return factuur.amountOriginalFormatted;
  }

  const totalOpen = factuur.termijnen
    .filter((termijn) => termijn.debtClearingDate === null)
    .reduce((sum, termijn) => sum + parseFloat(termijn.amountOriginal), 0);

  return displayAmount(totalOpen);
}

export function isFactuurInTermijnen(factuur: AfisFactuurFrontend): boolean {
  return factuur.status === 'factuur-in-termijnen';
}

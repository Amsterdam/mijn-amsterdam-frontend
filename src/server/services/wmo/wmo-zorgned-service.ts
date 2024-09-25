import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchAanvragen } from '../zorgned/zorgned-service';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types';
import {
  isAfterWCAGValidDocumentsDate,
  isEindeGeldigheidVerstreken,
} from './status-line-items/wmo-generic';
import {
  DATE_END_NOT_OLDER_THAN,
  REGELING_IDENTIFICATIE,
} from './wmo-config-and-types';
import { PRODUCTS_WITH_DELIVERY } from './wmo-status-line-items';

function isProductWithDelivery(
  wmoProduct: Pick<
    ZorgnedAanvraagTransformed,
    'productsoortCode' | 'leveringsVorm'
  >
) {
  const leveringsVorm = wmoProduct.leveringsVorm;
  const productsoortCode = wmoProduct.productsoortCode;

  // This check matches the products that should / can / will receive a delivery of goods / service / product(eventually).
  if (leveringsVorm in PRODUCTS_WITH_DELIVERY) {
    return PRODUCTS_WITH_DELIVERY[leveringsVorm].includes(productsoortCode);
  }

  return false;
}

export function isActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEOG = isEindeGeldigheidVerstreken(
    aanvraagTransformed.datumEindeGeldigheid,
    new Date()
  );

  let isActueel = !!aanvraagTransformed.isActueel;

  if (!isActueel && 'datumEindeGeldigheid' in aanvraagTransformed && !isEOG) {
    isActueel = true;
  }

  // Override actueel indien er nog geen levering heeft plaatsgevonden en de geldigheid nog niet is afgelopen
  if (
    !isActueel &&
    !aanvraagTransformed.datumEindeLevering &&
    !aanvraagTransformed.datumBeginLevering &&
    !isEOG &&
    isProductWithDelivery(aanvraagTransformed)
  ) {
    isActueel = true;
  }

  // Override actueel indien de einde geldigheid is verlopen
  if (isActueel && (isEOG || aanvraagTransformed.resultaat === 'afgewezen')) {
    isActueel = false;
  }

  return isActueel;
}

export async function fetchZorgnedAanvragenWMO(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestBodyParams = {
    maxeinddatum: DATE_END_NOT_OLDER_THAN,
    regeling: REGELING_IDENTIFICATIE,
  };

  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    {
      zorgnedApiConfigKey: 'ZORGNED_JZD',
      requestBodyParams,
    }
  );

  if (aanvragenResponse.status === 'OK') {
    // Filter the aanvragen that we should show in frontend.
    const aanvragenFiltered = aanvragenResponse.content
      ?.filter((aanvraagTransformed) => {
        return isAfterWCAGValidDocumentsDate(aanvraagTransformed.datumBesluit)
          ? !!aanvraagTransformed.resultaat
          : true;
      })
      .map((aanvraagTransformed) => {
        // Override isActueel for front-end.
        return {
          ...aanvraagTransformed,
          isActueel: isActueel(aanvraagTransformed),
        };
      });

    return apiSuccessResult(aanvragenFiltered);
  }
  return aanvragenResponse;
}

export const forTesting = {
  isActueel,
  fetchZorgnedAanvragenWMO,
  isProductWithDelivery,
};

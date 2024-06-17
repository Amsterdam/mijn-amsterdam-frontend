import { parseISO } from 'date-fns';
import { apiSuccessResult, isDateInPast } from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { fetchAanvragen } from '../zorgned/zorgned-service';
import {
  BESCHIKTPRODUCT_RESULTAAT,
  DATE_END_NOT_OLDER_THAN,
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  PRODUCTS_WITH_DELIVERY,
  REGELING_IDENTIFICATIE,
} from './wmo-config-and-types';

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

export function assignIsActueel(
  aanvraagTransformed: ZorgnedAanvraagTransformed
) {
  const isEOG =
    !!aanvraagTransformed.datumEindeGeldigheid &&
    isDateInPast(aanvraagTransformed.datumEindeGeldigheid); // is Einde Of Geldighed

  let isActueel = !!aanvraagTransformed.isActueel;

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
  if (isActueel && isEOG) {
    isActueel = false;
  }

  aanvraagTransformed.isActueel = isActueel;
}

// If aanvraag was requested after a specific date we should only show them to the user if there are documents attached.
function shouldBeVisibleToUser(aanvraag: ZorgnedAanvraagTransformed) {
  const datumAanvraag = parseISO(aanvraag.datumAanvraag);

  const isRequestedAfterSpecificDate =
    datumAanvraag >= MINIMUM_REQUEST_DATE_FOR_DOCUMENTS;

  const hasDocuments = !!aanvraag.documenten?.length;

  return isRequestedAfterSpecificDate ? hasDocuments : true;
}

export async function fetchZorgnedAanvragenWMO(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestBodyParams = {
    maxeinddatum: DATE_END_NOT_OLDER_THAN,
    regeling: REGELING_IDENTIFICATIE,
  };

  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    'ZORGNED_JZD',
    requestBodyParams
  );

  if (aanvragenResponse.status === 'OK') {
    // Filter the aanvragen that we should show in frontend.
    // After a specific date we only show aanvragen(voorziening) that have at least one document attached.
    const aanvragenFiltered = aanvragenResponse.content
      ?.filter((aanvraagTransformed) => {
        return (
          aanvraagTransformed.datumBesluit &&
          shouldBeVisibleToUser(aanvraagTransformed) &&
          BESCHIKTPRODUCT_RESULTAAT.includes(aanvraagTransformed.resultaat)
        );
      })
      .map((aanvraagTransformed) => {
        // Override isActueel for front-end.
        assignIsActueel(aanvraagTransformed);
        return aanvraagTransformed;
      });

    return apiSuccessResult(aanvragenFiltered);
  }
  return aanvragenResponse;
}

export const forTesting = {
  assignIsActueel,
  fetchZorgnedAanvragenWMO,
  isProductWithDelivery,
  shouldBeVisibleToUser,
};

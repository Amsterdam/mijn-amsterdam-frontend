import { apiSuccessResult } from '../../../universal/helpers/api';
import { GenericDocument } from '../../../universal/types/App.types';
import { fetchAanvragen } from '../zorgned/zorgned-service';
import { ZorgnedAanvraagTransformed, type BSN } from '../zorgned/zorgned-types';
import {
  FAKE_DECISION_DOCUMENT_ID,
  isAfterWCAGValidDocumentsDate,
  isDocumentDecisionDateActive,
  isEindeGeldigheidVerstreken,
} from './status-line-items/wmo-generic';
import {
  DATE_END_NOT_OLDER_THAN,
  ZORGNED_JZD_REGELING_IDENTIFICATIE,
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

function getFakeDecisionDocuments(
  aanvraagTransformed: ZorgnedAanvraagTransformed
): GenericDocument[] {
  if (
    !aanvraagTransformed.documenten.length &&
    aanvraagTransformed.resultaat === 'toegewezen' &&
    (aanvraagTransformed.datumBeginLevering ||
      aanvraagTransformed.datumEindeGeldigheid ||
      aanvraagTransformed.datumEindeLevering) &&
    isDocumentDecisionDateActive(aanvraagTransformed.datumAanvraag)
  ) {
    return [
      {
        id: FAKE_DECISION_DOCUMENT_ID,
        title: 'Besluit: mist',
        datePublished: aanvraagTransformed.datumBesluit,
        url: '',
        isVisible: false,
      },
    ];
  }
  return aanvraagTransformed.documenten;
}

export function isActueel(aanvraagTransformed: ZorgnedAanvraagTransformed) {
  const isEindeGeldigheid = isEindeGeldigheidVerstreken(
    aanvraagTransformed.datumEindeGeldigheid,
    new Date()
  );

  let isActueel = !!aanvraagTransformed.isActueel;

  if (
    !isActueel &&
    'datumEindeGeldigheid' in aanvraagTransformed &&
    !isEindeGeldigheid
  ) {
    isActueel = true;
  }

  // Override actueel indien er nog geen levering heeft plaatsgevonden en de geldigheid nog niet is afgelopen
  if (
    !isActueel &&
    !aanvraagTransformed.datumEindeLevering &&
    !aanvraagTransformed.datumBeginLevering &&
    !isEindeGeldigheid &&
    isProductWithDelivery(aanvraagTransformed)
  ) {
    isActueel = true;
  }

  // Override actueel indien de einde geldigheid is verlopen
  if (
    isActueel &&
    (isEindeGeldigheid || aanvraagTransformed.resultaat === 'afgewezen')
  ) {
    isActueel = false;
  }

  return isActueel;
}

export async function fetchZorgnedAanvragenWMO(bsn: BSN) {
  const requestBodyParams = {
    maxeinddatum: DATE_END_NOT_OLDER_THAN,
    regeling: ZORGNED_JZD_REGELING_IDENTIFICATIE,
  };

  const aanvragenResponse = await fetchAanvragen(bsn, {
    zorgnedApiConfigKey: 'ZORGNED_JZD',
    requestBodyParams,
  });

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
          // NOTE: Bij sommige aanvraagbehandelingsprocessen worden er geen besluitdocumenten bijgevoegd.
          // Wij voegen een nep document toe zodat de businesslogica tav de statustreinen obv Besluit: documenten kan blijven bestaan.
          // Zie ook MIJN-9343
          documenten: getFakeDecisionDocuments(aanvraagTransformed),
        } as ZorgnedAanvraagTransformed;
      });

    return apiSuccessResult(aanvragenFiltered);
  }
  return aanvragenResponse;
}

export const forTesting = {
  fetchZorgnedAanvragenWMO,
  getFakeDecisionDocuments,
  isActueel,
  isProductWithDelivery,
};

import {
  featureToggle,
  jzdDataRequestConfigs,
  type ZorgnedApiConfigKey,
} from './jzd-service-config.ts';
import {
  FAKE_DECISION_DOCUMENT_ID,
  getDecisionDocument,
  isAfterWCAGValidDocumentsDate,
  isCancelled,
  isDocumentDecisionDateActive,
  isEindeGeldigheidVerstreken,
} from './wmo/status-line-items/wmo-generic.ts';
import {
  DATE_END_NOT_OLDER_THAN,
  DOCUMENT_TITLE_BESLUIT_STARTS_WITH,
  ZORGNED_WMO_API_CONFIG_KEY,
  ZORGNED_WMO_REGELING_IDENTIFICATIE,
} from './wmo/wmo-config.ts';
import { PRODUCTS_WITH_DELIVERY } from './wmo/wmo-status-line-items.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import type { GenericDocument } from '../../../universal/types/App.types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import {
  fetchAanvragen,
  fetchCasusAanvragen,
} from '../zorgned/zorgned-service.ts';
import type { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';
import { type BSN } from '../zorgned/zorgned-types.ts';

function isProductWithDelivery(
  jzdProduct: Pick<
    ZorgnedAanvraagTransformed,
    'productsoortCode' | 'leveringsVorm'
  >
) {
  const leveringsVorm = jzdProduct.leveringsVorm;
  const productsoortCode = jzdProduct.productsoortCode;

  // This check matches the products that should / can / will receive a delivery of goods / service / product(eventually).
  if (
    leveringsVorm &&
    productsoortCode &&
    leveringsVorm in PRODUCTS_WITH_DELIVERY
  ) {
    return PRODUCTS_WITH_DELIVERY[leveringsVorm].includes(productsoortCode);
  }

  return false;
}

function getFakeDecisionDocuments(
  aanvraagTransformed: ZorgnedAanvraagTransformed
): GenericDocument[] {
  if (
    isDocumentDecisionDateActive(aanvraagTransformed.datumAanvraag) &&
    !getDecisionDocument(aanvraagTransformed.documenten) &&
    aanvraagTransformed.resultaat === 'toegewezen' &&
    aanvraagTransformed.datumBesluit &&
    (aanvraagTransformed.datumBeginLevering ||
      aanvraagTransformed.datumEindeGeldigheid ||
      aanvraagTransformed.datumEindeLevering)
  ) {
    return [
      ...aanvraagTransformed.documenten,
      {
        id: FAKE_DECISION_DOCUMENT_ID,
        title: `${DOCUMENT_TITLE_BESLUIT_STARTS_WITH} mist`,
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

export async function fetchZorgnedAanvragenJZD(
  bsn: BSN,
  zorgnedApiConfigKey: ZorgnedApiConfigKey = ZORGNED_WMO_API_CONFIG_KEY,
  regeling: string = ZORGNED_WMO_REGELING_IDENTIFICATIE
): Promise<ApiResponse<ZorgnedAanvraagTransformed[]>> {
  const requestBodyParams = {
    maxeinddatum: DATE_END_NOT_OLDER_THAN,
    regeling,
  };

  const fetchZorgnedAanvragen =
    featureToggle.service.fetchCasusAanvragen.isEnabled &&
    zorgnedApiConfigKey === ZORGNED_WMO_API_CONFIG_KEY
      ? fetchCasusAanvragen
      : fetchAanvragen;

  const aanvragenResponse = await fetchZorgnedAanvragen(bsn, {
    dataRequestConfig: getCustomApiConfig(
      jzdDataRequestConfigs[zorgnedApiConfigKey]
    ),
    requestBodyParams,
  });

  if (aanvragenResponse.status === 'OK') {
    // Filter the aanvragen that we should show in frontend.
    const aanvragenFiltered = aanvragenResponse.content
      ?.filter((aanvraagTransformed) => {
        return !isCancelled(aanvraagTransformed);
      })
      ?.filter((aanvraagTransformed) => {
        return aanvraagTransformed.datumBesluit &&
          isAfterWCAGValidDocumentsDate(aanvraagTransformed.datumBesluit)
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
  fetchZorgnedAanvragenWMO: fetchZorgnedAanvragenJZD,
  getFakeDecisionDocuments,
  isActueel,
  isProductWithDelivery,
};

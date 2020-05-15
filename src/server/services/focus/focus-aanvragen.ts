import { apiSuccesResult, dateSort } from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { ApiUrls, getApiConfigValue } from '../../config';
import { requestData } from '../../helpers';
import {
  transformFocusProductNotification,
  isRecentItem,
  transformFocusProductRecentCase,
} from './focus-helpers';
import {
  contentDocumentTitleTranslations,
  contentLabels,
  contentProductTitleTranslations,
} from './focus-aanvragen-content';
import {
  normalizeFocusSourceProduct,
  transformFocusProduct,
} from './focus-helpers';
import {
  FocusProduct,
  FocusProductFromSource,
  DocumentTitles,
} from './focus-types';

/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */

export function fetchFOCUS(
  sessionID: SessionID,
  productTitleTranslations: DocumentTitles = contentProductTitleTranslations,
  documentTitleTranslations: DocumentTitles = contentDocumentTitleTranslations
) {
  const sourceDataNormalized = requestData<FocusProduct[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,

      // Normalize the focus source response.
      transformResponse: data =>
        data
          .map((product: FocusProductFromSource) =>
            normalizeFocusSourceProduct(
              product,
              productTitleTranslations,
              documentTitleTranslations
            )
          )
          .sort(dateSort('datePublished', 'desc')),
    },
    sessionID,
    getApiConfigValue('FOCUS_AANVRAGEN', 'postponeFetch', false)
  );

  return sourceDataNormalized;
}

const focusAanvragenProducten = ['Bijstandsuitkering', 'Stadspas'];

export async function fetchFOCUSAanvragen(sessionID: SessionID) {
  const response = await fetchFOCUS(sessionID);

  if (response.status === 'OK') {
    // Filter out the products that we use for the lopende/afgehandelde aanvragen
    const focusProductsNormalized = response.content.filter(product =>
      focusAanvragenProducten.includes(product.title)
    );

    // Transform the normalized products to aanvragen content items.
    const focusAanvragen = focusProductsNormalized.map(product =>
      transformFocusProduct(product, contentLabels)
    );
    return apiSuccesResult(focusAanvragen);
  }

  return response;
}

export async function fetchFOCUSAanvragenGenerated(sessionID: SessionID) {
  const response = await fetchFOCUS(sessionID);
  const compareDate = new Date();

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (response.status === 'OK') {
    const focusProductsNormalized = response.content.filter(product =>
      focusAanvragenProducten.includes(product.title)
    );

    notifications = focusProductsNormalized.map(product =>
      transformFocusProductNotification(product, contentLabels)
    );

    cases = focusProductsNormalized
      .filter(product => isRecentItem(product.steps, compareDate))
      .map(prod => transformFocusProductRecentCase(prod));
  }

  return {
    cases,
    notifications,
  };
}

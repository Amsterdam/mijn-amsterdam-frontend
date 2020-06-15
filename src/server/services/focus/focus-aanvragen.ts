import { apiSuccesResult, dateSort } from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { ApiUrls, getApiConfigValue } from '../../config';
import { requestData } from '../../helpers';
import { contentLabels, titleTranslations } from './focus-aanvragen-content';
import {
  createFocusNotification,
  createFocusRecentCase,
  isRecentItem,
  normalizeFocusSourceProduct,
  transformFocusProduct,
  translateFocusProduct,
} from './focus-aanvragen-helpers';
import { FocusProduct, FocusProductFromSource, FocusItem } from './focus-types';

/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */
export function fetchFOCUS(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  const sourceDataNormalized = requestData<FocusProduct[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,

      // Normalize the focus source response.
      transformResponse: (data = []) => {
        if (raw) {
          return data;
        }

        if (Array.isArray(data)) {
          return data
            .map((product: FocusProductFromSource) =>
              normalizeFocusSourceProduct(product)
            )
            .sort(dateSort('datePublished', 'desc'));
        }
        return [];
      },
    },
    sessionID,
    samlToken,
    getApiConfigValue('FOCUS_AANVRAGEN', 'postponeFetch', false)
  );

  return sourceDataNormalized;
}

export const focusAanvragenProducten = ['Levensonderhoud', 'Stadspas'];

export async function fetchFOCUSAanvragen(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  const response = await fetchFOCUS(sessionID, samlToken, raw);

  if (raw) {
    return response;
  }

  if (response.status === 'OK') {
    // Filter out the products that we use for the lopende/afgehandelde aanvragen
    const focusProductsNormalized = response.content
      .filter(product => focusAanvragenProducten.includes(product.title))
      .map(product => translateFocusProduct(product, titleTranslations));

    // Transform the normalized products to aanvragen content items.
    const focusAanvragen = focusProductsNormalized.map(product =>
      transformFocusProduct(product, contentLabels)
    );

    return apiSuccesResult(focusAanvragen);
  }

  return response;
}

export async function fetchFOCUSAanvragenGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  const focusItemsResponse = await fetchFOCUSAanvragen(sessionID, samlToken);
  const compareDate = new Date();

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (focusItemsResponse.status === 'OK') {
    const items = focusItemsResponse.content as FocusItem[];

    notifications =
      items.map(focusItem =>
        createFocusNotification(focusItem, contentLabels)
      ) || [];

    cases =
      items
        .filter(focusItem => isRecentItem(focusItem.steps, compareDate))
        .map(focusItem => createFocusRecentCase(focusItem)) || [];
  }

  return {
    cases,
    notifications,
  };
}

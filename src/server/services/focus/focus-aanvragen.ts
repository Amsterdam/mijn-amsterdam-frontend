import { apiSuccesResult, dateSort } from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { ApiUrls, getApiConfigValue } from '../../config';
import { requestData } from '../../helpers';
import { contentLabels, titleTranslations } from './focus-aanvragen-content';
import {
  isRecentItem,
  normalizeFocusSourceProduct,
  transformFocusProduct,
  createFocusProductNotification,
  createFocusProductRecentCase,
  translateFocusProduct,
} from './focus-helpers';
import { tozoTitleTranslations } from './focus-tozo-content';
import { FocusProduct, FocusProductFromSource } from './focus-types';

/**
 * Focus api data has to be transformed extensively to make it readable and presentable to a client.
 */
export function fetchFOCUSRaw(sessionID: SessionID, samlToken: string) {
  const sourceDataRaw = requestData<FocusProduct[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,
    },
    sessionID,
    samlToken,
    getApiConfigValue('FOCUS_AANVRAGEN', 'postponeFetch', false)
  );

  return sourceDataRaw;
}

export function fetchFOCUS(sessionID: SessionID, samlToken: string) {
  const sourceDataNormalized = requestData<FocusProduct[]>(
    {
      url: ApiUrls.FOCUS_AANVRAGEN,

      // Normalize the focus source response.
      transformResponse: (data = []) => {
        if (true) {
          throw new Error('onooooo!');
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
  samlToken: string
) {
  const response = await fetchFOCUS(sessionID, samlToken);

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
  const response = await fetchFOCUS(sessionID, samlToken);
  const compareDate = new Date();

  let notifications: MyNotification[] = [];
  let cases: MyCase[] = [];

  if (response.status === 'OK') {
    const focusProductsNormalized = response.content
      .filter(product => focusAanvragenProducten.includes(product.title))
      .map(product => translateFocusProduct(product, tozoTitleTranslations));

    notifications = focusProductsNormalized.map(product =>
      createFocusProductNotification(product, contentLabels)
    );

    cases = focusProductsNormalized
      .filter(product => isRecentItem(product.steps, compareDate))
      .map(prod => createFocusProductRecentCase(prod));
  }

  return {
    cases,
    notifications,
  };
}

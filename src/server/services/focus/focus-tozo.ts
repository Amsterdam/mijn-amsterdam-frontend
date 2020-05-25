import {
  apiSuccesResult,
  apiUnknownResult,
  dateSort,
} from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { fetchFOCUS } from './focus-aanvragen';
import { fetchFOCUSCombined } from './focus-combined';
import {
  createFocusProductNotification,
  createFocusProductRecentCase,
  isRecentItem,
  translateFocusProduct,
} from './focus-helpers';
import {
  contentLabels,
  tozoTitleTranslations,
  TOZO_LENING_PRODUCT_TITLE,
  TOZO_UITKERING_PRODUCT_TITLE,
  TOZO_VOORSCHOT_PRODUCT_TITLE,
} from './focus-tozo-content';
import { FocusItem } from './focus-types';
import {
  createTozoProductSetStepsCollection,
  createFocusItemTozo,
  createFocusTozoAanvraagNotification,
} from './focus-tozo-helpers';

async function fetchFOCUSTozoNormalized(sessionID: SessionID) {
  const responseAanvragen = fetchFOCUS(sessionID);
  const responseCombined = fetchFOCUSCombined(sessionID);

  const [aanvragen, combined] = await Promise.all([
    responseAanvragen,
    responseCombined,
  ]);

  if (combined.status === 'OK' && aanvragen.status === 'OK') {
    const aanvragenNormalized = aanvragen.content
      .filter(product =>
        [TOZO_LENING_PRODUCT_TITLE, TOZO_UITKERING_PRODUCT_TITLE].includes(
          product.title
        )
      )
      .map(product => translateFocusProduct(product, tozoTitleTranslations))
      .sort(dateSort('dateStart'));

    const voorschottenNormalized = aanvragen.content
      .filter(product => [TOZO_VOORSCHOT_PRODUCT_TITLE].includes(product.title))
      .map(product => translateFocusProduct(product, tozoTitleTranslations))
      .sort(dateSort('dateStart'));

    const documenten = combined.content.tozodocumenten
      .filter(doc => ['E-AANVR-TOZO', 'E-AANVR-KBBZ'].includes(doc.type))
      .sort(dateSort('dateStart'));

    return apiSuccesResult({
      aanvragen: aanvragenNormalized,
      voorschotten: voorschottenNormalized,
      documenten,
    });
  }

  return apiUnknownResult('Cannot construct TOZO item');
}

export async function fetchFOCUSTozo(sessionID: SessionID) {
  const response = await fetchFOCUSTozoNormalized(sessionID);

  if (response.status === 'OK') {
    const { aanvragen, voorschotten, documenten } = response.content;

    const collection = createTozoProductSetStepsCollection({
      aanvragen,
      voorschotten,
      documenten,
      titleTranslations: tozoTitleTranslations,
      contentLabels: contentLabels,
    });

    const tozoItems: FocusItem[] = collection.map(createFocusItemTozo);

    return apiSuccesResult(tozoItems);
  }

  return response;
}

export async function fetchFOCUSTozoGenerated(sessionID: SessionID) {
  const responseNormalized = await fetchFOCUSTozoNormalized(sessionID);
  const responseTransformed = await fetchFOCUSTozo(sessionID);
  const compareDate = new Date();

  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];

  if (responseNormalized.status === 'OK') {
    const { aanvragen, voorschotten } = responseNormalized.content;

    for (const item of aanvragen) {
      notifications.push(createFocusProductNotification(item, contentLabels));
    }

    for (const item of voorschotten) {
      notifications.push(createFocusProductNotification(item, contentLabels));
    }

    // use the transformed content here because documents are coupled to aanvragen and producten
    if (responseTransformed.status === 'OK') {
      for (const item of responseTransformed.content) {
        if (isRecentItem(item.steps, compareDate)) {
          cases.push(createFocusProductRecentCase(item));
        }
      }

      notifications.push(
        ...responseTransformed.content.flatMap(item => {
          return item.steps[0].documents.map(doc =>
            createFocusTozoAanvraagNotification(item.id, doc)
          );
        })
      );
    }
  }

  return {
    cases,
    notifications,
  };
}

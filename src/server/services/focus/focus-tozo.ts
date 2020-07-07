import { FeatureToggle } from '../../../universal/config/app';
import {
  apiDependencyError,
  apiSuccesResult,
  dateSort,
} from '../../../universal/helpers';
import { MyCase, MyNotification } from '../../../universal/types';
import { fetchFOCUS } from './focus-aanvragen';
import { createFocusRecentCase, isRecentItem } from './focus-aanvragen-helpers';
import { fetchFOCUSCombined } from './focus-combined';
import {
  contentLabels,
  TOZO2_VOORSCHOT_PRODUCT_TITLE,
  tozoTitleTranslations,
  TOZO_AANVRAAG_DOCUMENT_TYPES,
  TOZO_AANVRAAG_STEP_ID,
  TOZO_DUMMY_DECISION_STEP_ID,
  TOZO_PRODUCT_TITLES,
  TOZO_VOORSCHOT_PRODUCT_TITLE,
} from './focus-tozo-content';
import {
  createFocusItemTozo,
  createFocusTozoAanvraagNotification,
  createFocusTozoStepNotification,
  createTozoProductSetStepsCollection,
  translateFocusTozoProduct,
} from './focus-tozo-helpers';
import { FocusItem } from './focus-types';
import { getSettledResult } from '../../../universal/helpers/api';

async function fetchFOCUSTozoNormalized(
  sessionID: SessionID,
  samlToken: string
) {
  const responseAanvragen = fetchFOCUS(sessionID, samlToken);
  const responseCombined = fetchFOCUSCombined(sessionID, samlToken);

  const [aanvragenResult, combinedResult] = await Promise.allSettled([
    responseAanvragen,
    responseCombined,
  ]);

  const FOCUS_AANVRAGEN = getSettledResult(aanvragenResult);
  const FOCUS_COMBINED = getSettledResult(combinedResult);

  if (FOCUS_COMBINED.status === 'OK' && FOCUS_AANVRAGEN.status === 'OK') {
    const aanvragenNormalized = FOCUS_AANVRAGEN.content
      .filter(product => {
        return TOZO_PRODUCT_TITLES.includes(product.title);
      })
      .map(product => translateFocusTozoProduct(product, tozoTitleTranslations))
      .sort(dateSort('dateStart'));

    const voorschottenNormalized = FOCUS_AANVRAGEN.content
      .filter(
        product =>
          TOZO_VOORSCHOT_PRODUCT_TITLE === product.title ||
          (FeatureToggle.tozo2active &&
            TOZO2_VOORSCHOT_PRODUCT_TITLE === product.title)
      )
      .map(product => translateFocusTozoProduct(product, tozoTitleTranslations))
      .sort(dateSort('dateStart'));

    const documenten = Array.isArray(FOCUS_COMBINED.content.tozodocumenten)
      ? FOCUS_COMBINED.content?.tozodocumenten
          .filter(doc => TOZO_AANVRAAG_DOCUMENT_TYPES.includes(doc.type))
          .map(document => {
            return {
              ...document,
              productTitle:
                FeatureToggle.tozo2active && document.type === 'E-AANVR-TOZ2'
                  ? 'Tozo 2'
                  : 'Tozo 1',
            };
          })
          .sort(dateSort('dateStart'))
      : [];

    return apiSuccesResult({
      aanvragen: aanvragenNormalized,
      voorschotten: voorschottenNormalized,
      documenten,
    });
  }

  return apiDependencyError({ FOCUS_AANVRAGEN, FOCUS_COMBINED });
}

export async function fetchFOCUSTozo(sessionID: SessionID, samlToken: string) {
  const response = await fetchFOCUSTozoNormalized(sessionID, samlToken);

  if (response.status === 'OK') {
    const { aanvragen, voorschotten, documenten } = response.content;

    if (!aanvragen.length && !voorschotten.length && !documenten.length) {
      return apiSuccesResult([]);
    }

    const tozoItems: FocusItem[] = [];

    for (const productTitle of ['Tozo 1', 'Tozo 2']) {
      const collection = createTozoProductSetStepsCollection({
        aanvragen: aanvragen.filter(
          aanvraag => aanvraag.productTitle === productTitle
        ),
        voorschotten: voorschotten.filter(
          voorschot => voorschot.productTitle === productTitle
        ),
        documenten: documenten.filter(
          document => document.productTitle === productTitle
        ),
        titleTranslations: tozoTitleTranslations,
        contentLabels: contentLabels,
        productTitle,
      });

      tozoItems.push(
        ...collection
          .filter(steps => !!steps.length)
          .map(steps => createFocusItemTozo(steps, productTitle))
      );
    }

    return apiSuccesResult(tozoItems);
  }

  return response;
}

export async function fetchFOCUSTozoGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  const responseTransformed = await fetchFOCUSTozo(sessionID, samlToken);
  const compareDate = new Date();

  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];

  // use the transformed content here because documents are coupled to aanvragen and producten
  if (responseTransformed.status === 'OK') {
    for (const item of responseTransformed.content) {
      if (isRecentItem(item.steps, compareDate)) {
        cases.push(createFocusRecentCase(item));
      }
    }

    notifications.push(
      ...responseTransformed.content.flatMap(item => {
        const notifications = [];

        for (const step of item.steps) {
          if (step.id === TOZO_AANVRAAG_STEP_ID) {
            for (const document of step.documents) {
              notifications.push(
                createFocusTozoAanvraagNotification(
                  item.id,
                  document,
                  item.productTitle || 'Tozo'
                )
              );
            }
          } else if (step.product === `${item.productTitle}-voorschot`) {
            notifications.push(
              createFocusTozoStepNotification(
                item,
                step,
                contentLabels,
                tozoTitleTranslations
              )
            );
          }
        }

        const lastUitkeringStep = item.steps
          .filter(
            step =>
              step.product === `${item.productTitle}-uitkering` &&
              step.id !== TOZO_DUMMY_DECISION_STEP_ID
          )
          .pop();

        if (lastUitkeringStep) {
          notifications.push(
            createFocusTozoStepNotification(
              item,
              lastUitkeringStep,
              contentLabels,
              tozoTitleTranslations
            )
          );
        }

        const lastLeningStep = item.steps
          .filter(
            step =>
              step.product === `${item.productTitle}-lening` &&
              step.id !== TOZO_DUMMY_DECISION_STEP_ID
          )
          .pop();

        if (lastLeningStep) {
          notifications.push(
            createFocusTozoStepNotification(
              item,
              lastLeningStep,
              contentLabels,
              tozoTitleTranslations
            )
          );
        }

        return notifications;
      })
    );
  }

  return {
    cases,
    notifications,
  };
}

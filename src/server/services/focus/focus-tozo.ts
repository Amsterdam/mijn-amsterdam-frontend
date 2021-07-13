import { AppRoutes } from '../../../universal/config/routes';
import {
  apiDependencyError,
  apiSuccesResult,
  dateSort,
} from '../../../universal/helpers';
import { isRecentCase } from '../../../universal/helpers/utils';
import { MyCase, MyNotification } from '../../../universal/types/App.types';
import { stepStatusLabels } from './focus-aanvragen-content';
import { createFocusRecentCase } from './focus-aanvragen-helpers';
import {
  fetchFOCUSCombined,
  FocusCombinedSourceResponse,
  FocusDocument,
} from './focus-combined';
import {
  createToxxItem,
  createToxxItemStep,
  createToxxItemStepNotifications,
  getProductTitleForDocument,
  sanitizeDocumentCodeId,
} from './focus-toxx-helpers';
import { tozoDocumentLabelSet } from './focus-tozo-content';
import { FocusItem, FocusItemStep } from './focus-types';

export function createTozoResult(
  tozodocumenten: FocusCombinedSourceResponse['tozodocumenten']
) {
  const documents: FocusDocument[] = Array.isArray(tozodocumenten)
    ? tozodocumenten
        .map((document) => {
          return {
            ...document,
            productTitle: getProductTitleForDocument(
              document,
              tozoDocumentLabelSet
            ),
          };
        })
        .sort(dateSort('datePublished'))
    : [];

  const tozoSteps: FocusItemStep[] = documents
    .map((document) => createToxxItemStep(document, tozoDocumentLabelSet))
    .filter(
      (step: FocusItemStep | null): step is FocusItemStep => step !== null
    );

  if (!tozoSteps.length) {
    return apiSuccesResult([]);
  }

  /**
   * Aggregate all aanvraag step documents and combine into 1.
   * For every aanvraag document received we only show 1 status step.
   * All these documents are applicable to 1 decision that will be made about the aanvraag.
   **/
  let aanvraagSteps: Record<string, FocusItemStep> = {};
  const otherSteps: FocusItemStep[] = [];

  for (const step of tozoSteps) {
    if (step && step.title === 'aanvraag') {
      if (step?.product && !aanvraagSteps[step.product]) {
        aanvraagSteps[step.product] = step;
      } else if (step?.product) {
        aanvraagSteps[step.product].documents.push(...step.documents);
      }
    } else if (step) {
      otherSteps.push(step);
    }
  }

  const tozoProductTitles = [
    'Tozo 1 (aangevraagd voor 1 juni 2020)',
    'Tozo 2 (aangevraagd vanaf 1 juni 2020)',
    'Tozo 3 (aangevraagd vanaf 1 oktober 2020)',
    'Tozo 4 (aangevraagd vanaf 1 april 2021)',
    'Tozo 5 (aangevraagd vanaf 1 juli 2021)',
  ];

  const tozoItems: FocusItem[] = [];

  for (const [i, title] of Object.entries(tozoProductTitles)) {
    const version = String(Number(i) + 1);
    const productTitle = `Tozo ${version}`;
    const steps = otherSteps.filter((step) => step.product === productTitle);

    if (aanvraagSteps[productTitle]) {
      steps.unshift(aanvraagSteps[productTitle]);
    }

    if (steps.length) {
      const tozoItem = createToxxItem({
        title,
        productTitle,
        steps,
        routeProps: {
          path: AppRoutes['INKOMEN/TOZO'],
          params: {
            version,
          },
        },
      });
      tozoItems.push(tozoItem);
    }
  }

  return apiSuccesResult(tozoItems);
}

export async function fetchFOCUSTozo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return createTozoResult(
      response.content.tozodocumenten.filter(
        (document) =>
          sanitizeDocumentCodeId(document.documentCodeId) in
          tozoDocumentLabelSet
      )
    );
  }

  return response;
}

export async function fetchFOCUSTozoGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const TOZO = await fetchFOCUSTozo(sessionID, passthroughRequestHeaders);

  if (TOZO.status === 'OK') {
    const compareDate = new Date();

    const notifications: MyNotification[] = TOZO.content.flatMap((item) =>
      createToxxItemStepNotifications(item, compareDate)
    );

    const cases: MyCase[] = TOZO.content
      .filter(
        (item) =>
          isRecentCase(item.datePublished, compareDate) ||
          item.status !== stepStatusLabels.besluit
      )
      .map(createFocusRecentCase)
      .filter((recentCase) => recentCase !== null);

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ TOZO });
}

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
import { bbzDocumentLabelSet } from './focus-bbz-content';
import { FocusItem, FocusItemStep } from './focus-types';

export function createBBZResult(
  bbzdocumenten: FocusCombinedSourceResponse['tozodocumenten']
) {
  const documents: FocusDocument[] = Array.isArray(bbzdocumenten)
    ? bbzdocumenten.map((document) => {
        return {
          ...document,
          productTitle: getProductTitleForDocument(
            document,
            bbzDocumentLabelSet
          ),
        };
      })
    : [];

  const bbzSteps: FocusItemStep[] = documents
    .map((document) => createToxxItemStep(document, bbzDocumentLabelSet))
    .filter(
      (step: FocusItemStep | null): step is FocusItemStep => step !== null
    )
    .sort(dateSort('datePublished'));

  if (!bbzSteps.length || !bbzSteps) {
    return apiSuccesResult([]);
  }

  /**
   * Aggregate all aanvraag step documents and combine into 1.
   * For every aanvraag document received we only show 1 status step.
   * All these documents are applicable to 1 decision that will be made about the aanvraag.
   **/
  let aanvraagSteps: Record<string, FocusItemStep> = {};
  const otherSteps: FocusItemStep[] = [];

  for (const step of bbzSteps) {
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

  if (aanvraagSteps['Bbz']) {
    otherSteps.unshift(aanvraagSteps['Bbz']);
  }

  const bbzItems: FocusItem[] = [
    createToxxItem({
      title: 'Bijstand voor zelfstandigen (Bbz)',
      productTitle: 'Bijstand voor zelfstandigen (Bbz)',
      steps: otherSteps,
      routeProps: {
        path: AppRoutes['INKOMEN/BBZ'],
        params: {
          version: '1',
        },
      },
    }),
  ];

  return apiSuccesResult(bbzItems);
}

export async function fetchFOCUSBbz(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return createBBZResult(
      response.content.tozodocumenten.filter(
        (document) =>
          sanitizeDocumentCodeId(document.documentCodeId) in bbzDocumentLabelSet
      )
    );
  }

  return response;
}

export async function fetchFOCUSBbzGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BBZ = await fetchFOCUSBbz(sessionID, passthroughRequestHeaders);

  if (BBZ?.status === 'OK') {
    const compareDate = new Date();

    const notifications: MyNotification[] = BBZ.content.flatMap((item) =>
      createToxxItemStepNotifications(item, compareDate)
    );

    const cases: MyCase[] = BBZ.content
      .filter(
        (item) =>
          isRecentCase(item.dateEnd || item.datePublished, compareDate) ||
          item.status !== stepStatusLabels.besluit
      )
      .map(createFocusRecentCase)
      .filter((recentCase) => recentCase !== null);

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ BBZ });
}

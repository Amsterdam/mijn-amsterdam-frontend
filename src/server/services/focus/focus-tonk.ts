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
import { tonkDocumentLabelSet } from './focus-tonk-content';
import {
  createToxxItem,
  createToxxItemStep,
  createToxxItemStepNotifications,
  getProductTitleForDocument,
  sanitizeDocumentCodeId,
} from './focus-toxx-helpers';
import { FocusItem, FocusItemStep } from './focus-types';
import { FeatureToggle } from '../../../universal/config/app';

export function createTonkResult(
  tonkdocumenten: FocusCombinedSourceResponse['tozodocumenten']
) {
  const documents: FocusDocument[] = Array.isArray(tonkdocumenten)
    ? tonkdocumenten.map((document) => {
        return {
          ...document,
          productTitle: getProductTitleForDocument(
            document,
            tonkDocumentLabelSet
          ),
        };
      })
    : [];

  const tonkSteps: FocusItemStep[] = documents
    .map((document) => createToxxItemStep(document, tonkDocumentLabelSet))
    .filter(
      (step: FocusItemStep | null): step is FocusItemStep => step !== null
    )
    .sort(dateSort('datePublished'));

  if (!tonkSteps.length) {
    return apiSuccesResult([]);
  }

  // Aggregate all aanvraag step documents and combine into 1
  let aanvraagSteps: Record<string, FocusItemStep> = {};
  const otherSteps: FocusItemStep[] = [];

  for (const step of tonkSteps) {
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

  if (aanvraagSteps['TONK']) {
    otherSteps.unshift(aanvraagSteps['TONK']);
  }

  const tonkItems: FocusItem[] = [
    createToxxItem({
      title: 'TONK',
      productTitle: 'TONK',
      steps: otherSteps,
      routeProps: {
        path: AppRoutes['INKOMEN/TONK'],
        params: {
          version: '1',
        },
      },
    }),
  ];

  return apiSuccesResult(tonkItems);
}

export async function fetchFOCUSTonk(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  if (!FeatureToggle.tonkActive) {
    return apiSuccesResult([]);
  }

  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return createTonkResult(
      response.content.tozodocumenten.filter((document) => {
        return (
          sanitizeDocumentCodeId(document.documentCodeId) in
          tonkDocumentLabelSet
        );
      })
    );
  }

  return response;
}

export async function fetchFOCUSTonkGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const TONK = await fetchFOCUSTonk(sessionID, passthroughRequestHeaders);

  if (TONK.status === 'OK') {
    const compareDate = new Date();

    const notifications: MyNotification[] = TONK.content.flatMap((item) =>
      createToxxItemStepNotifications(item, compareDate)
    );

    const cases: MyCase[] = TONK.content
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

  return apiDependencyError({ TONK });
}

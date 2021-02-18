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

export function createTonkResult(
  tozodocumenten: FocusCombinedSourceResponse['tozodocumenten']
) {
  const documents: FocusDocument[] = Array.isArray(tozodocumenten)
    ? tozodocumenten
        .map((document) => {
          return {
            ...document,
            productTitle: getProductTitleForDocument(
              document,
              tonkDocumentLabelSet
            ),
          };
        })
        .sort(dateSort('datePublished'))
    : [];

  const tonkSteps: FocusItemStep[] = documents
    .map((document) => createToxxItemStep(document, tonkDocumentLabelSet))
    .filter(
      (step: FocusItemStep | null): step is FocusItemStep => step !== null
    );

  if (!tonkSteps.length) {
    return apiSuccesResult([]);
  }

  const tonkItems: FocusItem[] = [
    createToxxItem({
      title: 'Tonk',
      productTitle: 'Tonk',
      steps: tonkSteps,
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
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return createTonkResult(
      response.content.tozodocumenten.filter(
        (document) =>
          sanitizeDocumentCodeId(document.documentCodeId) in
          tonkDocumentLabelSet
      )
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
      createToxxItemStepNotifications(item)
    );

    const cases: MyCase[] = TONK.content
      .filter(
        (item) =>
          isRecentCase(item.datePublished, compareDate) ||
          item.status !== stepStatusLabels.beslissing
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

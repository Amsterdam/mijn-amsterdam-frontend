import { Chapters } from '../../../universal/config';
import { FeatureToggle } from '../../../universal/config/app';
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

  // Aggregate all aanvraag step documents and combine into 1
  let aanvraagSteps: Record<string, FocusItemStep> = {};
  const otherSteps: FocusItemStep[] = [];

  for (const step of tozoSteps) {
    if (step && step.title === 'aanvraag') {
      if (step?.product && !aanvraagSteps[step.product]) {
        // step is not present, cache the step
        aanvraagSteps[step.product] = step;
      } else if (step?.product) {
        // step is present, add documents
        aanvraagSteps[step.product].documents.push(...step.documents);
      }
    } else if (step) {
      otherSteps.push(step);
    }
  }

  const tozo1Steps = otherSteps.filter((step) => step.product === 'Tozo 1');
  const tozo2Steps = otherSteps.filter((step) => step.product === 'Tozo 2');
  const tozo3Steps = otherSteps.filter((step) => step.product === 'Tozo 3');
  const tozo4Steps = otherSteps.filter((step) => step.product === 'Tozo 4');

  if (aanvraagSteps['Tozo 1']) {
    tozo1Steps.unshift(aanvraagSteps['Tozo 1']);
  }
  const tozo1Item =
    tozo1Steps.length &&
    createToxxItem({
      title: 'Tozo 1 (aangevraagd voor 1 juni 2020)',
      productTitle: 'Tozo 1',
      steps: tozo1Steps,
      routeProps: {
        path: AppRoutes['INKOMEN/TOZO'],
        params: {
          version: '1',
        },
      },
    });

  if (aanvraagSteps['Tozo 2']) {
    tozo2Steps.unshift(aanvraagSteps['Tozo 2']);
  }
  const tozo2Item =
    tozo2Steps.length &&
    createToxxItem({
      title: 'Tozo 2 (aangevraagd vanaf 1 juni 2020)',
      productTitle: 'Tozo 2',
      steps: tozo2Steps,
      routeProps: {
        path: AppRoutes['INKOMEN/TOZO'],
        params: {
          version: '2',
        },
      },
    });

  if (aanvraagSteps['Tozo 3']) {
    tozo3Steps.unshift(aanvraagSteps['Tozo 3']);
  }
  const tozo3Item =
    tozo3Steps.length &&
    createToxxItem({
      title: 'Tozo 3 (aangevraagd vanaf 1 oktober 2020)',
      productTitle: 'Tozo 3',
      steps: tozo3Steps,
      routeProps: {
        path: AppRoutes['INKOMEN/TOZO'],
        params: {
          version: '3',
        },
      },
    });

  if (aanvraagSteps['Tozo 4']) {
    tozo4Steps.unshift(aanvraagSteps['Tozo 4']);
  }
  const tozo4Item =
    tozo4Steps.length &&
    createToxxItem({
      title: 'Tozo 4 (aangevraagd vanaf 1 april 2021)',
      productTitle: 'Tozo 4',
      steps: tozo4Steps,
      routeProps: {
        path: AppRoutes['INKOMEN/TOZO'],
        params: {
          version: '4',
        },
      },
    });

  const tozoItems: FocusItem[] = [];

  if (tozo1Item) {
    tozoItems.push(tozo1Item);
  }

  if (tozo2Item) {
    tozoItems.push(tozo2Item);
  }

  if (tozo3Item) {
    tozoItems.push(tozo3Item);
  }

  if (FeatureToggle.tozo4Active && tozo4Item) {
    tozoItems.push(tozo4Item);
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

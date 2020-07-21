import { apiSuccesResult, dateSort } from '../../../universal/helpers';
import { isRecentCase } from '../../../universal/helpers/utils';
import { MyCase, MyNotification } from '../../../universal/types/App.types';
import { createFocusRecentCase } from './focus-aanvragen-helpers';
import { fetchFOCUSCombined, FocusTozoDocument } from './focus-combined';
import {
  createTozoDocumentStep,
  createTozoDocumentStepNotifications,
  createTozoItem,
  getProductTitleForDocument,
} from './focus-tozo-helpers';
import { FocusItem, FocusItemStep } from './focus-types';
import { stepStatusLabels } from './focus-aanvragen-content';

export async function fetchFOCUSTozo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    const documents: FocusTozoDocument[] = Array.isArray(
      response.content.tozodocumenten
    )
      ? response.content.tozodocumenten
          // .filter(doc => TOZO_AANVRAAG_DOCUMENT_TYPES.includes(doc.type))
          .map(document => {
            return {
              ...document,
              productTitle: getProductTitleForDocument(document),
            };
          })
          .sort(dateSort('datePublished'))
      : [];

    const tozoSteps: Array<FocusItemStep | null> = documents.map(document =>
      createTozoDocumentStep(document)
    );

    if (!tozoSteps.length) {
      return apiSuccesResult([]);
    }

    const tozo1Steps = tozoSteps.filter(
      (step: FocusItemStep | null): step is FocusItemStep =>
        step !== null && step.product === 'Tozo 1'
    );

    const tozo2Steps = tozoSteps.filter(
      (step: FocusItemStep | null): step is FocusItemStep =>
        step !== null && step.product === 'Tozo 2'
    );

    const tozo1Item = tozo1Steps.length && createTozoItem('Tozo 1', tozo1Steps);
    const tozo2Item = tozo2Steps.length && createTozoItem('Tozo 2', tozo2Steps);
    const tozoItems: FocusItem[] = [];

    if (tozo1Item) {
      tozoItems.push(tozo1Item);
    }

    if (tozo2Item) {
      tozoItems.push(tozo2Item);
    }

    return apiSuccesResult(tozoItems);
  }

  return response;
}

export async function fetchFOCUSTozoGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const tozoItems = await fetchFOCUSTozo(sessionID, passthroughRequestHeaders);

  if (tozoItems.status === 'OK') {
    const compareDate = new Date();

    const notifications: MyNotification[] = tozoItems.content.flatMap(item =>
      createTozoDocumentStepNotifications(item)
    );

    const cases: MyCase[] = tozoItems.content
      .filter(
        item =>
          isRecentCase(item.datePublished, compareDate) ||
          item.status !== stepStatusLabels.beslissing
      )
      .map(createFocusRecentCase)
      .filter(recentCase => recentCase !== null);

    return {
      cases,
      notifications,
    };
  }

  return tozoItems;
}

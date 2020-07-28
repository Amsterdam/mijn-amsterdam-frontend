import { isRecentCase } from '../../../universal/helpers/utils';
import { MyCase, MyNotification } from '../../../universal/types/App.types';
import { stepStatusLabels } from './focus-aanvragen-content';
import { createFocusRecentCase } from './focus-aanvragen-helpers';
import { fetchFOCUSCombined } from './focus-combined';
import {
  createTozoDocumentStepNotifications,
  createTozoResult,
} from './focus-tozo-helpers';

export async function fetchFOCUSTozo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    return createTozoResult(response.content.tozodocumenten);
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

import { apiSuccesResult, dateSort } from '../../../universal/helpers';
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
  const TOZO = await fetchFOCUSTozo(sessionID, passthroughRequestHeaders);

  if (TOZO.status === 'OK') {
    const compareDate = new Date();

    const notifications: MyNotification[] = TOZO.content.flatMap(item =>
      createTozoDocumentStepNotifications(item)
    );

    const cases: MyCase[] = TOZO.content
      .filter(
        item =>
          isRecentCase(item.datePublished, compareDate) ||
          item.status !== stepStatusLabels.beslissing
      )
      .map(createFocusRecentCase)
      .filter(recentCase => recentCase !== null);

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ TOZO });
}

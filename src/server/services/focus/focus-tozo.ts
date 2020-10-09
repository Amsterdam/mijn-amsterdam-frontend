import {
  apiSuccesResult,
  dateSort,
  apiDependencyError,
} from '../../../universal/helpers';
import { isRecentCase } from '../../../universal/helpers/utils';
import { MyCase, MyNotification } from '../../../universal/types/App.types';
import { stepStatusLabels } from './focus-aanvragen-content';
import { createFocusRecentCase } from './focus-aanvragen-helpers';
import { fetchFOCUSCombined } from './focus-combined';
import { FeatureToggle } from '../../../universal/config/app';
import {
  createTozoItemStepNotifications,
  createTozoResult,
} from './focus-tozo-helpers';
import { Chapters } from '../../../universal/config';

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
      createTozoItemStepNotifications(item)
    );

    if (
      !FeatureToggle.tozo3active &&
      TOZO.content.some(item => item.productTitle === 'Tozo 2')
    ) {
      notifications.push({
        chapter: Chapters.INKOMEN,
        datePublished: '2020-10-01',
        isAlert: false,
        hideDatePublished: false,
        id: `focus-tozo3-notification`,
        title: `Tozo 3`,
        description: `Hebt u Tozo 3 aangevraagd (aanvragen na 1 oktober 2020)? Wij
                werken er hard aan om ook die aanvraag in Mijn Amsterdam te
                tonen. Als het zover is, ziet u uw aanvraag vanzelf hier
                verschijnen.`,
      });
    }

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

import { Chapters } from '../../../universal/config';
import { FeatureToggle } from '../../../universal/config/app';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../../universal/helpers';
import { isRecentCase } from '../../../universal/helpers/utils';
import { MyCase, MyNotification } from '../../../universal/types/App.types';
import { stepStatusLabels } from './focus-aanvragen-content';
import { createFocusRecentCase } from './focus-aanvragen-helpers';
import { fetchFOCUSCombined } from './focus-combined';
import {
  createTozoItemStepNotifications,
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

    const notifications: MyNotification[] = TOZO.content.flatMap((item) =>
      createTozoItemStepNotifications(item)
    );

    if (
      !FeatureToggle.tozo4active &&
      TOZO.content.some((item) => item.productTitle === 'Tozo 3')
    ) {
      notifications.push({
        chapter: Chapters.INKOMEN,
        datePublished: '2021-02-20',
        isAlert: false,
        hideDatePublished: false,
        id: `focus-tozo4-notification`,
        title: `Tozo 4`,
        description: `Hebt u Tozo 4 aangevraagd (aanvragen vanaf 1 XXXX 2021)? Wij
                werken er hard aan om ook die aanvraag in Mijn Amsterdam te
                tonen. Als het zover is, ziet u uw aanvraag vanzelf hier
                verschijnen.`,
      });
    }

    const cases: MyCase[] = TOZO.content
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

  return apiDependencyError({ TOZO });
}

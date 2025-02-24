import { differenceInMonths, parseISO } from 'date-fns';
import memoizee from 'memoizee';

import {
  NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED,
  NotificationLabelByType,
  NotificationLabels,
  NotificationProperty,
  VergunningFrontendV2,
} from './config-and-types';
import { decosCaseToZaakTransformers } from './decos-zaken';
import { isNearEndDate } from './helpers';
import { fetchVergunningen } from './vergunningen';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { Thema, Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { getStatusDate } from '../decos/helpers';

// prettier-ignore
export function getNotificationLabels(
  notificationLabels: Partial<NotificationLabelByType>,
  vergunning: VergunningFrontendV2,
  compareToDate: Date = new Date()
) {
  // Ignore formatting of the switch case statements for readability
  switch (true) {
    // TODO: Check if we always have Verleend as decision for expirable vergunning
    case notificationLabels.verlooptBinnenkort &&
      vergunning.decision === 'Verleend' &&
      isNearEndDate(vergunning.dateEnd, compareToDate):
      return notificationLabels.verlooptBinnenkort;

    case notificationLabels.isVerlopen &&
      vergunning.decision === 'Verleend' &&
      vergunning.isExpired &&
      vergunning.dateEnd &&
      differenceInMonths(parseISO(vergunning.dateEnd), compareToDate) <
        NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED:
      return notificationLabels.isVerlopen;

    case notificationLabels.isIngetrokken &&
      vergunning.decision === 'Ingetrokken' &&
      vergunning.dateDecision &&
      isRecentNotification(vergunning.dateDecision):
      return notificationLabels.isIngetrokken;

    case notificationLabels.statusAfgehandeld &&
      vergunning.processed &&
      vergunning.dateDecision &&
      isRecentNotification(vergunning.dateDecision):
      return notificationLabels.statusAfgehandeld;

    case notificationLabels.statusInBehandeling &&
      !vergunning.processed &&
      !!getStatusDate('In behandeling', vergunning):
      return notificationLabels.statusInBehandeling;

    case notificationLabels.statusAanvraag && !vergunning.processed:
      return notificationLabels.statusAanvraag;
  }

  return null;
}

function getNotificationBase(vergunning: VergunningFrontendV2, thema: Thema) {
  const notificationBaseProperties = {
    thema: thema,
    id: `vergunning-${vergunning.id}-notification`,
    link: {
      to: vergunning.link.to,
      title: 'Bekijk details',
    },
  };
  return notificationBaseProperties;
}

function mergeNotificationProperties(
  notification: Partial<MyNotification>,
  content: NotificationLabels,
  vergunning: VergunningFrontendV2
) {
  for (const [key, getValue] of Object.entries(content)) {
    notification[key as NotificationProperty] = getValue(vergunning);
  }
  return notification as MyNotification;
}

export function createVergunningNotification(
  vergunning: VergunningFrontendV2,
  thema: Thema
): MyNotification | null {
  const zaakTypeTransformer = decosCaseToZaakTransformers[vergunning.caseType];
  const labels = zaakTypeTransformer.notificationLabels;

  if (labels) {
    const notificationBase = getNotificationBase(vergunning, thema);
    const notificationLabels = getNotificationLabels(labels, vergunning);
    if (notificationLabels !== null) {
      return mergeNotificationProperties(
        notificationBase,
        notificationLabels,
        vergunning
      );
    }
  }

  return null;
}

export function getVergunningNotifications(
  vergunningen: VergunningFrontendV2[],
  thema: Thema
) {
  return vergunningen
    .map((vergunning) => createVergunningNotification(vergunning, thema))
    .filter(
      (notification: MyNotification | null): notification is MyNotification =>
        notification !== null
    );
}

async function fetchVergunningenNotifications_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL'],
  thema: Thema = Themas.VERGUNNINGEN
) {
  const VERGUNNINGEN = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    appRoute
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications(
      VERGUNNINGEN.content,
      thema
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}

export const fetchVergunningenNotifications = memoizee(
  fetchVergunningenNotifications_,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
    length: 5,
  }
);

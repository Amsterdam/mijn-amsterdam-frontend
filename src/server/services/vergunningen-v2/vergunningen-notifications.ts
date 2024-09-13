import { differenceInMonths, parseISO } from 'date-fns';
import memoizee from 'memoizee';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { Thema, Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';
import { ONE_SECOND_MS } from '../../config';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED,
  NotificationLabelByType,
  NotificationLabels,
  NotificationProperty,
  VergunningFilter,
  VergunningFrontendV2,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { isNearEndDate } from './helpers';
import {
  FILTER_VERGUNNINGEN_DEFAULT,
  fetchVergunningenV2,
} from './vergunningen';

// prettier-ignore
export function getNotificationLabels(
  notificationLabels: Partial<NotificationLabelByType>,
  vergunning: VergunningFrontendV2,
  vergunningen: VergunningFrontendV2[],
  compareToDate: Date = new Date()
) {
  // Ignore formatting of the switch case statements for readability
  switch (true) {
    // TODO: Check if we always have Verleend as decision for expirable vergunning
    case notificationLabels.verlooptBinnenkort && vergunning.decision === 'Verleend' && isNearEndDate(vergunning, compareToDate):
      return notificationLabels.verlooptBinnenkort;

    case notificationLabels.isVerlopen && vergunning.decision === 'Verleend' && vergunning.isExpired && vergunning.dateEnd && differenceInMonths(parseISO(vergunning.dateEnd), compareToDate) < NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED:
      return notificationLabels.isVerlopen;

    case notificationLabels.isIngetrokken && vergunning.decision === 'Ingetrokken' && vergunning.dateDecision && isRecentNotification(vergunning.dateDecision):
      return notificationLabels.isIngetrokken;

    case notificationLabels.statusAfgehandeld && vergunning.processed && vergunning.dateDecision && isRecentNotification(vergunning.dateDecision):
      return notificationLabels.statusAfgehandeld;

    case notificationLabels.statusInBehandeling && !vergunning.processed && !!vergunning.dateInBehandeling:
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
  vergunningen: VergunningFrontendV2[],
  thema: Thema
): MyNotification | null {
  const zaakTypeTransformer = decosZaakTransformers[vergunning.caseType];
  const labels = zaakTypeTransformer.notificationLabels;

  if (labels) {
    const notificationBase = getNotificationBase(vergunning, thema);
    const notificationLabels = getNotificationLabels(
      labels,
      vergunning,
      vergunningen
    );
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
    .map((vergunning, index, allVergunningen) =>
      createVergunningNotification(vergunning, allVergunningen, thema)
    )
    .filter(
      (notification: MyNotification | null): notification is MyNotification =>
        notification !== null
    );
}

async function fetchVergunningenV2Notifications_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL'],
  filter: VergunningFilter = FILTER_VERGUNNINGEN_DEFAULT,
  thema: Thema = Themas.VERGUNNINGEN
) {
  const VERGUNNINGEN = await fetchVergunningenV2(
    requestID,
    authProfileAndToken,
    appRoute,
    filter
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

export const fetchVergunningenV2Notifications = memoizee(
  fetchVergunningenV2Notifications_,
  {
    maxAge: 45 * ONE_SECOND_MS,
    length: 5,
  }
);

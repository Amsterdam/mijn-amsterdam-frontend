import { differenceInMonths, parseISO } from 'date-fns';

import {
  NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED,
  NotificationLabelByType,
  NotificationLabels,
  VergunningFrontend,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { fetchVergunningen } from './vergunningen';
import { isNearEndDate } from './vergunningen-helpers';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaID, Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DecosZaakBase, DecosZaakTransformer } from '../decos/config-and-types';

export function getNotificationLabels(
  notificationLabels: Partial<NotificationLabelByType>,
  vergunning: VergunningFrontend,
  compareToDate: Date = new Date()
) {
  // Ignore formatting of the switch case statements for readability
  switch (true) {
    // NOTE: It's not kown if we always have Verleend as decision for expirable vergunning
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
      vergunning.steps.some((step) => step.status === 'In behandeling'):
      return notificationLabels.statusInBehandeling;

    case notificationLabels.statusAanvraag && !vergunning.processed:
      return notificationLabels.statusAanvraag;
  }

  return null;
}

function getNotificationBase(
  vergunning: VergunningFrontend,
  thema: ThemaID
): Pick<MyNotification, 'thema' | 'id' | 'link'> {
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
  notificationBase: Pick<MyNotification, 'thema' | 'id' | 'link'>,
  content: NotificationLabels,
  vergunning: VergunningFrontend
): MyNotification {
  const notificationLabels: Pick<MyNotification, keyof typeof content> = {
    title: content.title(vergunning),
    description: content.description(vergunning),
    datePublished: content.datePublished(vergunning),
    link: content.link(vergunning),
  };

  return { ...notificationBase, ...notificationLabels };
}

export function createVergunningNotification<DZ extends DecosZaakBase>(
  vergunning: VergunningFrontend<DZ>,
  zaakTypeTransformer: DecosZaakTransformer<DZ>,
  thema: ThemaID
): MyNotification | null {
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

export function getVergunningNotifications<DZ extends DecosZaakBase>(
  vergunningen: VergunningFrontend<DZ>[],
  decosZaakTransformers: DecosZaakTransformer<DZ>[],
  thema: ThemaID
) {
  return vergunningen
    .map((vergunning) => {
      const zaakTransformer = decosZaakTransformers.find(
        (transformer) => transformer.caseType === vergunning.caseType
      );
      if (!zaakTransformer) {
        return null;
      }
      return createVergunningNotification(vergunning, zaakTransformer, thema);
    })
    .filter(
      (notification: MyNotification | null): notification is MyNotification =>
        notification !== null
    );
}

export async function fetchVergunningenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const VERGUNNINGEN = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    AppRoutes['VERGUNNINGEN/DETAIL']
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications<any>(
      VERGUNNINGEN.content,
      decosZaakTransformers,
      Themas.VERGUNNINGEN
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}

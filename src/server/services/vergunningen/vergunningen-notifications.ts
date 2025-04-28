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
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DecosZaakBase, DecosZaakTransformer } from '../decos/config-and-types';
import { getActiveStatus } from '../decos/decos-helpers';

export function getNotificationLabels(
  notificationLabels: Partial<NotificationLabelByType>,
  vergunning: VergunningFrontend,
  compareToDate: Date = new Date()
) {
  const activeStatus = getActiveStatus(vergunning);
  // Ignore formatting of the switch case statements for readability
  switch (true) {
    case notificationLabels.verlooptBinnenkort &&
      vergunning.processed &&
      isNearEndDate(vergunning.dateEnd, compareToDate):
      return notificationLabels.verlooptBinnenkort;

    case notificationLabels.isVerlopen &&
      activeStatus === 'Verlopen' &&
      vergunning.dateEnd &&
      differenceInMonths(parseISO(vergunning.dateEnd), compareToDate) <
        NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED:
      return notificationLabels.isVerlopen;

    case notificationLabels.isIngetrokken &&
      activeStatus === 'Ingetrokken' &&
      vergunning.dateDecision &&
      isRecentNotification(vergunning.dateDecision):
      return notificationLabels.isIngetrokken;

    case notificationLabels.statusAfgehandeld &&
      activeStatus === 'Afgehandeld' &&
      vergunning.dateDecision &&
      isRecentNotification(vergunning.dateDecision):
      return notificationLabels.statusAfgehandeld;

    case notificationLabels.statusInBehandeling &&
      activeStatus === 'In behandeling':
      return notificationLabels.statusInBehandeling;

    case notificationLabels.statusOntvangen && activeStatus === 'Ontvangen':
      return notificationLabels.statusOntvangen;
  }

  return null;
}

function getNotificationBase<ID extends string>(
  vergunning: VergunningFrontend,
  themaID: ID,
  themaTitle: string
): Pick<MyNotification, 'themaID' | 'themaTitle' | 'id' | 'link'> {
  const notificationBaseProperties = {
    themaID: themaID,
    themaTitle,
    id: `vergunning-${vergunning.id}-notification`,
    link: {
      to: vergunning.link.to,
      title: 'Bekijk details',
    },
  };
  return notificationBaseProperties;
}

function mergeNotificationProperties(
  notificationBase: Pick<
    MyNotification,
    'themaID' | 'themaTitle' | 'id' | 'link'
  >,
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

export function createVergunningNotification<
  DZ extends DecosZaakBase,
  ID extends string = string,
>(
  vergunning: VergunningFrontend<DZ>,
  zaakTypeTransformer: DecosZaakTransformer<DZ>,
  themaID: ID,
  themaTitle: string
): MyNotification | null {
  const labels = zaakTypeTransformer.notificationLabels;

  if (labels) {
    const notificationBase = getNotificationBase(
      vergunning,
      themaID,
      themaTitle
    );
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

export function getVergunningNotifications<
  DZ extends DecosZaakBase,
  ID extends string = string,
>(
  vergunningen: VergunningFrontend<DZ>[],
  decosZaakTransformers: DecosZaakTransformer<DZ>[],
  themaID: ID,
  themaTitle: string
) {
  return vergunningen
    .map((vergunning) => {
      const zaakTransformer = decosZaakTransformers.find(
        (transformer) => transformer.caseType === vergunning.caseType
      );
      if (!zaakTransformer) {
        return null;
      }
      return createVergunningNotification(
        vergunning,
        zaakTransformer,
        themaID,
        themaTitle
      );
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
    routeConfig.detailPage.path
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications<any>(
      VERGUNNINGEN.content,
      decosZaakTransformers,
      themaId,
      themaTitle
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}

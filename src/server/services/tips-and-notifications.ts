import { marked } from 'marked';
import memoize from 'memoizee';

import { fetchAdoptableTrashContainers } from './adoptable-trash-containers';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import {
  ApiResponse_DEPRECATED,
  getSettledResult,
} from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import type { MyNotification } from '../../universal/types';
import { AuthProfileAndToken } from '../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../config/source-api';
import { fetchAfisNotifications } from './afis/afis-notifications';
import { fetchAVGNotifications } from './avg/avg';
import { fetchBezwarenNotifications } from './bezwaren/bezwaren';
import { fetchLoodMetingNotifications } from './bodem/loodmetingen';
import { fetchBrpNotifications } from './brp';
import { sanitizeCmsContent } from './cms-content';
import { fetchMaintenanceNotificationsDashboard } from './cms-maintenance-notifications';
import { TipFrontend } from './content-tips/tip-types';
import {
  convertTipToNotication,
  prefixTipNotification,
} from './content-tips/tips-service';
import { fetchHorecaNotifications } from './horeca';
import { fetchKlachtenNotifications } from './klachten/klachten';
import { fetchKrefiaNotifications } from './krefia';
import {
  fetchBelastingNotifications,
  fetchErfpachtNotifications,
  fetchMilieuzoneNotifications,
  fetchOvertredingenNotifications,
  fetchSubsidieNotifications,
} from './simple-connect';
import { fetchSVWINotifications } from './simple-connect/svwi';
import { fetchToeristischeVerhuurNotifications } from './toeristische-verhuur/toeristische-verhuur-notifications';
import { fetchVarenNotifications } from './varen/varen-notifications';
import { fetchVergunningenNotifications } from './vergunningen/vergunningen';
import { fetchVergunningenV2Notifications } from './vergunningen-v2/vergunningen-notifications';
import { fetchWiorNotifications } from './wior';
import { fetchWpiNotifications } from './wpi';

const INSERT_TIP_AT_EVERY_NTH_INDEX = 3;

export function sortNotificationsAndInsertTips(
  notifications: MyNotification[],
  doRandomize: boolean = true
) {
  // sort the notifications with and without a tip
  const sorted = notifications
    .sort(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  const notificationsWithoutTips = sorted.filter((n) => !n.isTip);

  let notificationsWithTips = sorted.filter((n) => n.isTip);

  if (doRandomize) {
    // Simple randomization
    notificationsWithTips = notificationsWithTips
      .map((tip) => ({ tip, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ tip }) => tip);
  }

  // Insert a tip after every 3 notifications
  const notificationsWithTipsInserted = notificationsWithoutTips.reduce(
    (acc, notification, index) => {
      // Add tip before next notification
      if (
        index !== 0 &&
        index % INSERT_TIP_AT_EVERY_NTH_INDEX === 0 &&
        notificationsWithTips.length > 0
      ) {
        const tip = notificationsWithTips.shift();
        if (tip) {
          acc.push(tip);
        }
      }
      acc.push(notification);
      return acc;
    },
    [] as MyNotification[]
  );

  // Add the remaining tips at the end.
  if (notificationsWithTips.length) {
    notificationsWithTipsInserted.push(...notificationsWithTips);
  }

  return notificationsWithTipsInserted;
}

export function getTipsAndNotificationsFromApiResults(
  responses: Array<ApiResponse_DEPRECATED<unknown>>
): MyNotification[] {
  const notifications: MyNotification[] = [];
  const tips: TipFrontend[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const { content } of responses) {
    if (content === null || typeof content !== 'object') {
      continue;
    }
    // Collection of notifications
    if ('notifications' in content && Array.isArray(content.notifications)) {
      notifications.push(...content.notifications);
    }

    // Collection of tips
    if ('tips' in content && Array.isArray(content.tips)) {
      for (const tip of content.tips) {
        if (tip.isNotification) {
          notifications.push(tip);
        } else {
          tips.push(tip);
        }
      }
    }
  }

  const notificationsResult = notifications.map((notification) => {
    if (notification.description) {
      notification.description = sanitizeCmsContent(
        marked(notification.description)
      );
    }
    if (notification.moreInformation) {
      notification.moreInformation = sanitizeCmsContent(
        marked(notification.moreInformation)
      );
    }
    return notification;
  });

  const tipsResult = tips
    .map((notification) => {
      if (notification.description) {
        notification.description = sanitizeCmsContent(notification.description);
      }
      return notification;
    })
    .map(convertTipToNotication)
    .map(prefixTipNotification);

  return [...notificationsResult, ...tipsResult];
}

type FetchNotificationFunction = (
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) => Promise<ApiResponse_DEPRECATED<unknown>>;

type NotificationServices = Record<string, FetchNotificationFunction>;

type NotificationServicesByProfileType = Record<
  ProfileType,
  NotificationServices
>;

const notificationServices: NotificationServicesByProfileType = {
  commercial: {
    afis: fetchAfisNotifications,
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    vergunningen: FeatureToggle.vergunningenV2Active
      ? fetchVergunningenV2Notifications
      : fetchVergunningenNotifications,
    horeca: fetchHorecaNotifications,
    erfpacht: fetchErfpachtNotifications,
    maintenanceNotifications: (requestID: RequestID) =>
      fetchMaintenanceNotificationsDashboard(requestID),
    subsidie: fetchSubsidieNotifications,
    toeristischeVerhuur: (
      requestID: RequestID,
      authProfileAndToken: AuthProfileAndToken
    ) =>
      fetchToeristischeVerhuurNotifications(
        requestID,
        authProfileAndToken,
        new Date()
      ),
    bodem: fetchLoodMetingNotifications,
    bezwaren: fetchBezwarenNotifications,
    varen: fetchVarenNotifications,
  },
  'private-attributes': {},
  private: {
    adoptTrashContainer: fetchAdoptableTrashContainers,
    afis: fetchAfisNotifications,
    avg: fetchAVGNotifications,
    belasting: fetchBelastingNotifications,
    bezwaren: fetchBezwarenNotifications,
    bodem: fetchLoodMetingNotifications,
    brp: fetchBrpNotifications,
    erfpacht: fetchErfpachtNotifications,
    fetchKrefia: fetchKrefiaNotifications,
    fetchSVWI: fetchSVWINotifications,
    fetchWior: fetchWiorNotifications,
    fetchWpi: fetchWpiNotifications,
    horeca: fetchHorecaNotifications,
    klachten: fetchKlachtenNotifications,
    maintenance: (requestID: RequestID) =>
      fetchMaintenanceNotificationsDashboard(requestID),
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    subsidie: fetchSubsidieNotifications,
    toeristischeVerhuur: fetchToeristischeVerhuurNotifications,
    vergunningen: FeatureToggle.vergunningenV2Active
      ? fetchVergunningenV2Notifications
      : fetchVergunningenNotifications,
  },
};

// Services can return Source tips and Content tips.
async function fetchNotificationsAndTipsFromServices_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<MyNotification[]> {
  if (authProfileAndToken.profile.profileType !== 'private-attributes') {
    const profileType = authProfileAndToken.profile.profileType;
    const services: NotificationServices = notificationServices[profileType];

    const results = await Promise.allSettled(
      Object.values(services).map((fetchNotifications) =>
        fetchNotifications(requestID, authProfileAndToken)
      )
    );

    return getTipsAndNotificationsFromApiResults(results.map(getSettledResult));
  }

  return [];
}

export const fetchNotificationsAndTipsFromServices = memoize(
  fetchNotificationsAndTipsFromServices_,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
    normalizer: function (args) {
      // args is arguments object as accessible in memoized function
      return args[0] + JSON.stringify(args[1]);
    },
  }
);

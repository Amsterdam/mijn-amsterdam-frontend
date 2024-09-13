import { marked } from 'marked';
import memoize from 'memoizee';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { ApiResponse, getSettledResult } from '../../universal/helpers/api';
import { dateSort } from '../../universal/helpers/date';
import type { MyNotification, MyTip } from '../../universal/types';
import { AuthProfileAndToken } from '../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../config/source-api';
import { fetchAVGNotifications } from './avg/avg';
import { fetchBezwarenNotifications } from './bezwaren/bezwaren';
import { fetchLoodMetingNotifications } from './bodem/loodmetingen';
import { fetchBrpNotifications } from './brp';
import { sanitizeCmsContent } from './cms-content';
import { fetchMaintenanceNotificationsDashboard } from './cms-maintenance-notifications';
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
import {
  convertTipToNotication,
  prefixTipNotification,
} from './tips/tips-service';
import { fetchToeristischeVerhuurNotifications } from './toeristische-verhuur/toeristische-verhuur';
import { fetchVergunningenV2Notifications } from './vergunningen-v2/vergunningen-notifications';
import { fetchVergunningenNotifications } from './vergunningen/vergunningen';
import { fetchWiorNotifications } from './wior';
import { fetchWpiNotifications } from './wpi';

export function sortNotifications(
  notifications: MyNotification[],
  doRandomize: boolean = true
) {
  // sort the notifications with and without a tip
  let sorted = notifications
    .sort(dateSort('datePublished', 'desc'))
    // Put the alerts on the top regardless of the publication date
    .sort((a, b) => (a.isAlert === b.isAlert ? 0 : a.isAlert ? -1 : 0));

  const notificationsWithoutTips = sorted.filter((n) => !n.isTip);

  let notificationsWithTips = sorted.filter((n) => n.isTip);

  if (doRandomize) {
    // Simple randomization
    notificationsWithTips = notificationsWithTips
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  // Insert a tip after every 3 notifications
  const notificationsWithTipsInserted = notificationsWithoutTips.reduce(
    (acc, notification, index) => {
      if (index !== 0 && index % 3 === 0 && notificationsWithTips.length > 0) {
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
  responses: Array<ApiResponse<any>>
): MyNotification[] {
  const notifications: MyNotification[] = [];
  const tips: MyTip[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const { content } of responses) {
    if (content === null || typeof content !== 'object') {
      continue;
    }
    // Collection of notifications
    if ('notifications' in content) {
      notifications.push(...content.notifications);
    }

    // Collection of tips
    if ('tips' in content) {
      for (const tip of content.tips) {
        // Should we show the tip as Notification?
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
) => Promise<ApiResponse<any>>;

type NotificationServices = Record<string, FetchNotificationFunction>;

type NotificationServicesByProfileType = Record<
  ProfileType,
  NotificationServices
>;

const notificationServices: NotificationServicesByProfileType = {
  commercial: {
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    vergunningen: FeatureToggle.vergunningenV2Active
      ? fetchVergunningenV2Notifications
      : fetchVergunningenNotifications,
    horeca: fetchHorecaNotifications,
    erfpacht: fetchErfpachtNotifications,
    maintenanceNotifications: (requestID: requestID) =>
      fetchMaintenanceNotificationsDashboard(requestID),
    subsidie: fetchSubsidieNotifications,
    toeristischeVerhuur: (
      requestID: requestID,
      authProfileAndToken: AuthProfileAndToken
    ) =>
      fetchToeristischeVerhuurNotifications(
        requestID,
        authProfileAndToken,
        new Date()
      ),
    bodem: fetchLoodMetingNotifications,
    bezwaren: fetchBezwarenNotifications,
  },
  'private-attributes': {},
  private: {
    brp: fetchBrpNotifications,
    belasting: fetchBelastingNotifications,
    milieuzone: fetchMilieuzoneNotifications,
    overtredingen: fetchOvertredingenNotifications,
    vergunningen: FeatureToggle.vergunningenV2Active
      ? fetchVergunningenV2Notifications
      : fetchVergunningenNotifications,
    erfpacht: fetchErfpachtNotifications,
    subsidie: fetchSubsidieNotifications,
    maintenance: (requestID: requestID) =>
      fetchMaintenanceNotificationsDashboard(requestID),
    toeristischeVerhuur: fetchToeristischeVerhuurNotifications,
    fetchKrefia: fetchKrefiaNotifications,
    fetchWior: fetchWiorNotifications,
    fetchWpi: fetchWpiNotifications,
    fetchSVWI: fetchSVWINotifications,
    klachten: fetchKlachtenNotifications,
    horeca: fetchHorecaNotifications,
    avg: fetchAVGNotifications,
    bodem: fetchLoodMetingNotifications,
    bezwaren: fetchBezwarenNotifications,
  },
};

async function fetchServicesNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<MyNotification[]> {
  if (authProfileAndToken.profile.profileType !== 'private-attributes') {
    const profileType = authProfileAndToken.profile.profileType;
    const services: NotificationServices = notificationServices[profileType];

    const results = await Promise.allSettled(
      Object.values(services).map((fetchNotifactions) =>
        fetchNotifactions(requestID, authProfileAndToken)
      )
    );

    return getTipsAndNotificationsFromApiResults(results.map(getSettledResult));
  }

  return [];
}

export const fetchTipsAndNotifications = memoize(fetchServicesNotifications, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    // args is arguments object as accessible in memoized function
    return args[0] + JSON.stringify(args[1]);
  },
});

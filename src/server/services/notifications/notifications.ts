import UID from 'uid-safe';

import {
  listProfileIds,
  upsertConsumer,
  storeNotifications,
  listProfiles,
} from './notifications-model';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { notificationServices } from '../tips-and-notifications';
import {
  BSN,
  CONSUMER_ID,
  NOTIFICATION_LEAN,
  SERVICE_ID,
} from './config-and-types';
import { MyNotification } from '../../../universal/types/App.types';

/**
 * The Notification service allows batch handling of notifications for previously verified consumers
 */

export async function registerConsumer(
  profileId: BSN,
  consumerId: CONSUMER_ID,
  service_ids: SERVICE_ID[] = []
) {
  return upsertConsumer(profileId, consumerId, service_ids);
}

export async function batchFetchAndStoreNotifications() {
  const profiles = await listProfileIds();
  for (const profile of profiles) {
    const promises = profile.service_ids.map(
      async (service_id) =>
        await fetchNotificationsForService(profile.profile_id, service_id)
    );
    const notifications = (await Promise.all(promises)).flat();
    await storeNotifications(profile.profile_id, notifications);
  }
}

export async function batchFetchNotifications() {
  const profiles = await listProfiles();
  return profiles.flatMap((profile) => ({
    service_ids: profile.service_ids,
    consumer_ids: profile.consumer_ids,
    date_updated: profile.date_updated,
    notifications: profile.content?.notifications || [],
  }));
}

async function fetchNotificationsForService(
  profileId: BSN,
  service_id: SERVICE_ID
): Promise<NOTIFICATION_LEAN[]> {
  const BYTE_LENGTH = 16;
  const authProfileAndToken: AuthProfileAndToken = {
    // TODO: Update notificationServices to accept a leaner AuthProfileAndToken with only profile.id and profile.profileType
    profile: {
      authMethod: 'digid',
      profileType: 'private',
      sid: `overridden-${UID.sync(BYTE_LENGTH)}}`,
      id: profileId,
    } as const,
    token: 'notprovided',
    expiresAtMilliseconds: 1,
  };

  const fetchNotificationsForService = notificationServices.private[service_id];
  const response = await fetchNotificationsForService(authProfileAndToken);
  if (response.status !== 'OK' || response.content == null) {
    return [];
  }

  const notifications = Object.values(response.content)
    .flat()
    .filter((n) => n != null) as MyNotification[];
  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    isTip: notification.isTip,
    isAlert: notification.isAlert,
    datePublished: notification.hideDatePublished
      ? undefined
      : notification.datePublished,
  }));
}

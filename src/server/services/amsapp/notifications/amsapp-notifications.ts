import UID from 'uid-safe';

import {
  listProfileIds,
  upsertConsumer,
  listProfiles,
  truncate,
  deleteConsumer,
  getProfileByConsumer,
  storeNotifications,
} from './amsapp-notifications-model';
import { DISCRETE_GENERIC_MESSAGE } from './amsapp-notifications-service-config';
import type {
  BSN,
  ConsumerId,
  ServiceId,
  ConsumerProfileCompact,
  NotificationsLean,
} from './amsapp-notifications-types';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../../universal/helpers/api';
import { isDateInFuture } from '../../../../universal/helpers/date';
import type { MyNotification } from '../../../../universal/types/App.types';
import type { AuthProfileAndToken } from '../../../auth/auth-types';
import { notificationServices } from '../../tips-and-notifications';

/**
 * The Notification service allows batch handling of notifications for previously verified consumers
 */

export async function registerConsumer(
  profileId: BSN,
  profileName: string,
  consumerId: ConsumerId,
  serviceIds: ServiceId[] = []
) {
  return upsertConsumer(profileId, profileName, consumerId, serviceIds);
}

export async function unregisterConsumer(consumerId: ConsumerId) {
  const numDeleted = await deleteConsumer(consumerId);
  return numDeleted > 0;
}

export async function getConsumerProfile(consumerId: ConsumerId) {
  const profile = (await getProfileByConsumer(consumerId)) as
    | (ConsumerProfileCompact & { isRegistered: boolean })
    | null;
  return { ...profile, isRegistered: profile !== null };
}

export async function batchDeleteNotifications() {
  return truncate();
}

export async function batchFetchAndStoreNotifications() {
  const profiles = await listProfileIds();
  for (const profile of profiles) {
    const promises = profile.serviceIds.map(async (serviceId) => {
      const notifications = await fetchNotificationsForService(
        profile.profileId,
        serviceId
      );
      return {
        ...notifications,
        serviceId,
        dateUpdated: new Date().toISOString(),
      };
    });
    const responses = await Promise.all(promises);
    await storeNotifications(profile.profileId, responses);
  }
}

export async function batchFetchNotifications() {
  const profiles = await listProfiles();
  return profiles.map((profile) => ({
    consumerIds: profile.consumerIds,
    dateUpdated: profile.dateUpdated,
    services: profile.content?.services || [],
    profileName: profile.profileName,
  }));
}

async function fetchNotificationsForService(
  profileId: BSN,
  serviceId: ServiceId
): Promise<ApiResponse<NotificationsLean[]>> {
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

  const fetchNotificationsForService = notificationServices.private[serviceId];
  const response = await fetchNotificationsForService(authProfileAndToken);
  if (response.status !== 'OK') {
    return apiErrorResult(
      `Could not fetch notifications for service ${serviceId} ${response.status === 'ERROR' ? ` - ${response.message}` : ''}`,
      null
    );
  }

  const dateSevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const notifications = Object.values(response.content ?? [])
    .flat()
    .filter(
      (n): n is MyNotification =>
        n != null && isDateInFuture(n.datePublished, dateSevenDaysAgo) // Storing seven days of notifications should provide enough buffer to account for any historic issues arising from erros or failing to fetch data from the services
    )
    .map((notification) => ({
      id: notification.id,
      themaId: notification.themaID,
      // If we decide to show the actual notification title, use `notification.title`
      title: DISCRETE_GENERIC_MESSAGE,
      isTip: notification.isTip,
      isAlert: notification.isAlert,
      datePublished: notification.hideDatePublished
        ? undefined
        : notification.datePublished,
    }));

  return apiSuccessResult(notifications);
}

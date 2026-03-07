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
import type { MyNotification } from '../../../../universal/types/App.types';
import type { AuthProfileAndToken } from '../../../auth/auth-types';
import {
  notificationServices,
  type NotificationsAndTipsResponse,
} from '../../tips-and-notifications';

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
      const serviceResponse = await fetchNotificationsForService(
        profile.profileId,
        serviceId
      );
      const notifications = transformNotificationsForExternalUse(
        serviceId,
        serviceResponse
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
): Promise<NotificationsAndTipsResponse> {
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
  return await fetchNotificationsForService(authProfileAndToken);
}

function transformNotificationsForExternalUse(
  serviceId: ServiceId,
  serviceResponse: NotificationsAndTipsResponse
): ApiResponse<NotificationsLean[]> {
  if (serviceResponse.status !== 'OK') {
    return apiErrorResult(
      `Could not fetch notifications for service ${serviceId}}`,
      null
    );
  }

  const notifications = Object.values(serviceResponse.content ?? [])
    .flat()
    .filter((n): n is MyNotification => n != null)
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

import { getAuthProfileAndTokenWithoutSession } from './amsapp-notifications-helper';
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
import { toISOString } from '../../../../universal/helpers/date';
import { entries, pick } from '../../../../universal/helpers/utils';
import {
  fetchNotificationsAndTipsFromServices,
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

  if (profile == null) {
    return { isRegistered: false };
  }
  return { ...profile, isRegistered: true };
}

export async function batchDeleteNotifications() {
  return truncate();
}

export async function storeNotificationsResponses(
  profileId: BSN,
  serviceResponses: Partial<Record<ServiceId, NotificationsAndTipsResponse>>,
  options?: {
    /**
     * When true, also updates `last_login_date` for the profile.
     * Use this for user-driven flows (login), not for scheduled batch jobs.
     */
    updateLastLoginDate?: boolean;
  }
): Promise<void> {
  const now = toISOString(new Date());
  const lastLoginDate = options?.updateLastLoginDate ? now : null;
  const responses = entries(serviceResponses)
    .filter(
      // Unsuccessful responses do not contain new notifications
      (
        serviceResponse
      ): serviceResponse is [ServiceId, NotificationsAndTipsResponse] =>
        (serviceResponse[1] != null && serviceResponse[1].status) === 'OK'
    )
    .map(
      ([serviceId, response]: [ServiceId, NotificationsAndTipsResponse]) => ({
        ...transformNotificationsForExternalUse(serviceId, response),
        serviceId,
        dateUpdated: now,
      })
    );

  await storeNotifications(profileId, responses, lastLoginDate);
}

export async function batchFetchAndStoreNotifications() {
  const profiles = await listProfileIds();
  for (const profile of profiles) {
    const authProfileAndToken = getAuthProfileAndTokenWithoutSession(
      profile.profileId
    );
    const notificationAndTipsResults =
      await fetchNotificationsAndTipsFromServices(
        authProfileAndToken,
        pick(notificationServices.private, profile.serviceIds)
      );
    await storeNotificationsResponses(
      profile.profileId,
      notificationAndTipsResults
    );
  }
}

export async function batchFetchNotifications(options: {
  dateFrom?: string;
  offset?: number;
  limit?: number;
}) {
  const profiles = await listProfiles(options);
  return profiles.map((profile) => ({
    consumerIds: profile.consumerIds,
    dateUpdated: profile.dateUpdated,
    lastLoginDate: profile.lastLoginDate,
    services: Object.values(profile.content?.services || {}),
  }));
}

function transformNotificationsForExternalUse(
  serviceId: ServiceId,
  serviceResponse: NotificationsAndTipsResponse
): ApiResponse<NotificationsLean[]> {
  if (serviceResponse.status !== 'OK') {
    return apiErrorResult(
      `Could not fetch notifications for service ${serviceId}`,
      null
    );
  }

  const notifications = Object.values(
    serviceResponse.content.notifications ?? []
  )
    .filter((n) => n !== null && !n.isTip && !!n.datePublished)
    .map((notification) => ({
      id: notification.id,
      // If we decide to show the actual notification title, use `notification.title`
      title: DISCRETE_GENERIC_MESSAGE,
      datePublished: toISOString(notification.datePublished) ?? '',
    }))
    .filter((n) => !!n.datePublished);

  return apiSuccessResult(notifications);
}

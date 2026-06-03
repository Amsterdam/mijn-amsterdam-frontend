import { getAuthProfileAndTokenWithoutSession } from './amsapp-notifications-helper.ts';
import {
  listProfileIds,
  listConsumerIdsWithLoginExpiryDateBefore,
  upsertConsumer,
  deleteOrphanProfiles,
  listProfiles,
  truncate,
  deleteConsumers,
  getProfileByConsumer,
  storeNotifications,
} from './amsapp-notifications-model.ts';
import { DISCRETE_GENERIC_MESSAGE } from './amsapp-notifications-service-config.ts';
import type {
  BSN,
  ConsumerId,
  NotificationsLean,
  ServiceId,
} from './amsapp-notifications-types.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../../universal/helpers/api.ts';
import { toISOString } from '../../../../universal/helpers/date.ts';
import { entries, pick } from '../../../../universal/helpers/utils.ts';
import { getApiConfig } from '../../../helpers/source-api-helpers.ts';
import { requestData } from '../../../helpers/source-api-request.ts';
import {
  fetchNotificationsAndTipsFromServices,
  notificationServices,
  type NotificationsAndTipsResponse,
} from '../../tips-and-notifications.ts';
/**
 * The Notification service allows batch handling of notifications for previously verified consumers
 */

type UnregisterConsumerOptions = {
  triggerAmsAppUnregisterConsumerWebhook?: boolean;
};

async function sendAmsAppUnregisterConsumerWebhook(consumerIds: ConsumerId[]) {
  const requestConfig = getApiConfig('AMSAPP', {
    formatUrl: ({ url }) => {
      return `${url}/notifications/logout`;
    },
    enableCache: false,
    data: {
      consumerIds,
    },
  });

  // Best effort attempt, no need to triage
  await requestData<unknown>(requestConfig);
}

export async function unregisterConsumers(
  consumerIds: ConsumerId[],
  options: UnregisterConsumerOptions = {}
) {
  const deletedConsumerIds = await deleteConsumers(consumerIds);

  if (
    options.triggerAmsAppUnregisterConsumerWebhook &&
    deletedConsumerIds.length > 0
  ) {
    await sendAmsAppUnregisterConsumerWebhook(deletedConsumerIds);
  }

  return deletedConsumerIds;
}

export async function registerConsumer(
  profileId: BSN,
  profileName: string,
  consumerId: ConsumerId,
  serviceIds: ServiceId[] = []
) {
  await upsertConsumer(profileId, profileName, consumerId, serviceIds);

  // Cleanup runs in the background so registration is not blocked by removal of orphan profiles.
  void deleteOrphanProfiles().catch(() => undefined);
}

export async function unregisterExpiredConsumers(
  loginExpiryDateUpperBound: Date = new Date()
) {
  const expiredConsumerIds = await listConsumerIdsWithLoginExpiryDateBefore(
    loginExpiryDateUpperBound
  );

  await unregisterConsumers(expiredConsumerIds, {
    triggerAmsAppUnregisterConsumerWebhook: true,
  });
}

export async function getConsumerProfile(consumerId: ConsumerId) {
  const profile = await getProfileByConsumer(consumerId);

  if (profile == null) {
    return { isRegistered: false };
  }

  return {
    profileName: profile.profileName,
    serviceIds: profile.serviceIds,
    dateUpdated: toISOString(profile.dateUpdated) ?? '',
    lastLoginDate: profile.lastLoginDate
      ? toISOString(profile.lastLoginDate)
      : null,
    loginExpiryDate: profile.loginExpiryDate
      ? toISOString(profile.loginExpiryDate)
      : null,
    isRegistered: true,
  };
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
  const nowDate = new Date();
  const now = toISOString(nowDate);
  const lastLoginDate = options?.updateLastLoginDate ? nowDate : null;

  const temporaryExcludedServices: ServiceId[] = ['belasting'] as const; // MIJN-12971: Temporary filter to not push notifications repeatedly for notifications that have a datePublished set to today everyday
  const responses = entries(serviceResponses)
    .filter(
      // Unsuccessful responses do not contain new notifications
      (
        serviceResponse
      ): serviceResponse is [ServiceId, NotificationsAndTipsResponse] =>
        (serviceResponse[1] != null && serviceResponse[1].status) === 'OK'
    )
    .filter(
      ([serviceId, _]: [ServiceId, NotificationsAndTipsResponse]) =>
        !temporaryExcludedServices.includes(serviceId) // MIJN-12971: Temporary filter to not push notifications repeatedly for notifications that have a datePublished set to today everyday
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
    consumerDetails: profile.consumerDetails.map((consumerDetail) => ({
      id: consumerDetail.id,
      loginExpiryDate: toISOString(consumerDetail.loginExpiryDate) ?? '',
    })),
    consumerIds: profile.consumerDetails.map(
      (consumerDetail) => consumerDetail.id
    ),
    dateUpdated: toISOString(profile.dateUpdated) ?? '',
    lastLoginDate: profile.lastLoginDate
      ? toISOString(profile.lastLoginDate)
      : null,
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

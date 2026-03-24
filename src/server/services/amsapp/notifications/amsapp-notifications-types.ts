import type { ApiResponse } from '../../../../universal/helpers/api.ts';
import type { MyNotification } from '../../../../universal/types/App.types.ts';
import type { AuthProfile } from '../../../auth/auth-types.ts';
import type { notificationServices } from '../../tips-and-notifications.ts';

export type BSN = AuthProfile['id'];
export type ConsumerId = string;
export type ServiceId = keyof typeof notificationServices.private;

export type ConsumerProfile = {
  profileId: BSN;
  consumerIds: ConsumerId[];
  serviceIds: ServiceId[];
  dateUpdated: string;
  lastLoginDate: string | null;
  content: { services: Record<ServiceId, NotificationsService> } | null;
};

export type ConsumerProfileCompact = Omit<
  ConsumerProfile,
  'profileId' | 'content' | 'consumerIds'
>;

export type NotificationsService = {
  serviceId: ServiceId;
  dateUpdated: string;
} & ApiResponse<NotificationsLean[]>;

export type NotificationsLean = Pick<
  MyNotification,
  'id' | 'title' | 'datePublished'
>;

export type AuthProfileId = {
  profile: Pick<AuthProfile, 'id' | 'profileType'>;
};

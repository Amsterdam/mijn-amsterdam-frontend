import type { ApiResponse } from '../../../../universal/helpers/api';
import { MyNotification } from '../../../../universal/types/App.types';
import { AuthProfile } from '../../../auth/auth-types';
import { notificationServices } from '../../tips-and-notifications';

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

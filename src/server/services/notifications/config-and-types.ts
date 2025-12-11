import type { ApiResponse } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfile } from '../../auth/auth-types';
import { notificationServices } from '../tips-and-notifications';

export type BSN = AuthProfile['id'];
export type CONSUMER_ID = string;
export type SERVICE_ID = keyof typeof notificationServices.private;

export type ConsumerNotifications = {
  profileId: BSN;
  consumerIds: CONSUMER_ID[];
  serviceIds: SERVICE_ID[];
  dateUpdated: string;
  content: { services: NOTIFICATION_SERVICE[] } | null;
};

export type NOTIFICATION_SERVICE = {
  serviceId: SERVICE_ID;
  dateUpdated: string;
} & ApiResponse<NOTIFICATION_LEAN[]>;

export type NOTIFICATION_LEAN = Pick<
  MyNotification,
  'id' | 'title' | 'isAlert' | 'isTip'
> & { datePublished: string | undefined };

export type AuthProfileId = {
  profile: Pick<AuthProfile, 'id' | 'profileType'>;
};

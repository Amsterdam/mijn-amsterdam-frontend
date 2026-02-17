import type { AMSAPP_NOTIFICATIONS_DEEP_LINK } from './notifications-router';
import type { ApiResponse } from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfile } from '../../auth/auth-types';
import { notificationServices } from '../tips-and-notifications';

export type BSN = AuthProfile['id'];
export type ConsumerId = string;
export type ServiceId = keyof typeof notificationServices.private;

export type ConsumerNotifications = {
  profileId: BSN;
  consumerIds: ConsumerId[];
  serviceIds: ServiceId[];
  dateUpdated: string;
  content: { services: NotificationsService[] } | null;
};

export type NotificationsService = {
  serviceId: ServiceId;
  dateUpdated: string;
} & ApiResponse<NotificationsLean[]>;

export type NotificationsLean = Pick<
  MyNotification,
  'id' | 'title' | 'isAlert' | 'isTip'
> & { datePublished: string | undefined };

export type AuthProfileId = {
  profile: Pick<AuthProfile, 'id' | 'profileType'>;
};
export type ApiError = {
  code: string;
  message: string;
};
export type RenderProps = {
  nonce: string;
  promptOpenApp: boolean;
  urlToImage: string;
  urlToCSS: string;
  error?: ApiError;
  identifier?: string; // Only included in debug build.
  appHref?: `${typeof AMSAPP_NOTIFICATIONS_DEEP_LINK}/${'gelukt' | 'mislukt'}${string}`;
};

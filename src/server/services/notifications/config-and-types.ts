import { MyNotification } from '../../../universal/types/App.types.ts';
import { AuthProfile } from '../../auth/auth-types.ts';
import { notificationServices } from '../tips-and-notifications.ts';

export type BSN = AuthProfile['id'];
export type CONSUMER_ID = string;
export type SERVICE_ID = keyof typeof notificationServices.private;
export type NOTIFICATION_LEAN = Pick<
  MyNotification,
  'id' | 'title' | 'isAlert' | 'isTip'
> & { datePublished: string | undefined };

export type AuthProfileId = {
  profile: Pick<AuthProfile, 'id' | 'profileType'>;
};

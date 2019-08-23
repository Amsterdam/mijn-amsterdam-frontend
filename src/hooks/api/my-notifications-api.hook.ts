import { Chapter, WelcomeNotification } from 'App.constants';
import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import { dateSort } from 'helpers/App';
import { useLocalStorage } from 'hooks/storage.hook';
import { ApiState } from './api.types';

export interface MyNotification {
  id: string;
  chapter: Chapter;
  datePublished: string;
  title: string | JSX.Element;
  description: string | JSX.Element;
  link?: LinkProps;
  isUnread?: boolean; // Was this notification presented to the user / has it been read
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface MyNotificationsApiState extends ApiState {
  data: {
    items: MyNotification[];
    total: number;
  };
}

export function useMyNotificationsState() {
  return useLocalStorage('MY_NOTIFICATIONS', {});
}

// NOTE: Currently we only extract/construct notifications from the main focus api data which is not specifically tailored for this use.
// In the future we will get specifically tailored generic notification content from various api's which will be integrated in
// a domain wide notifications stream.
export default ({
  FOCUS,
}: Pick<AppState, 'FOCUS'>): MyNotificationsApiState => {
  const [myNotificationsState] = useMyNotificationsState();
  const items = [
    // Static content welcome message
    WelcomeNotification,
    // Focus notification items
    ...FOCUS.data.notifications.map(notification => {
      return {
        ...notification,
        isUnread: myNotificationsState
          ? !(notification.id in myNotificationsState)
          : true,
      };
    }),
  ].sort(dateSort('datePublished', 'desc'));

  return {
    ...FOCUS,
    data: {
      items,
      total: items.length,
    },
  };
};

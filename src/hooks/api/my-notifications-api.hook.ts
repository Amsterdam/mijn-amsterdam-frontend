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
  Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
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

function isUnread(
  notification: MyNotification,
  myNotificationsState: MyNotificationsApiState
) {
  return {
    ...notification,
    isUnread: myNotificationsState
      ? !(notification.id in myNotificationsState)
      : true,
  };
}

// NOTE: Currently we only extract/construct notifications from the main focus api data which is not specifically tailored for this use.
// In the future we will get specifically tailored generic notification content from various api's which will be integrated in
// a domain wide notifications stream.
export default ({
  FOCUS,
  BRP,
}: Pick<AppState, 'FOCUS' | 'BRP'>): MyNotificationsApiState => {
  const [myNotificationsState] = useMyNotificationsState();
  const [welcomeDate] = useLocalStorage(
    'welcomeDate',
    new Date().toISOString()
  );
  const items = [
    // Static content welcome message
    Object.assign(WelcomeNotification, { datePublished: welcomeDate }),
    // Focus notification items
    ...FOCUS.data.notifications,
    // BRP Notifications
    ...BRP.data.notifications,
  ]
    .map(notification => isUnread(notification, myNotificationsState))
    .sort(dateSort('datePublished', 'desc'));

  const isLoading = BRP.isLoading || FOCUS.isLoading;
  const isError = BRP.isError || FOCUS.isError;
  const isDirty = BRP.isDirty && FOCUS.isDirty;
  const isPristine = BRP.isPristine && FOCUS.isPristine;

  return {
    isLoading,
    isError,
    isDirty,
    isPristine,
    errorMessage: '',
    data: {
      items,
      total: items.length,
    },
  };
};

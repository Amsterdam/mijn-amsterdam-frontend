import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import { Chapter, WelcomeNotification } from 'config/App.constants';
import { dateSort } from 'helpers/App';
import { useLocalStorage } from 'hooks/storage.hook';
import { useMemo } from 'react';
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
  return useLocalStorage('MELDINGEN', {});
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

  const items = useMemo(
    () =>
      [
        // Static content welcome message
        WelcomeNotification,
        // Focus notification items
        ...FOCUS.data.notifications,
        // BRP Notifications
        ...BRP.notifications,
      ]
        .map(notification => isUnread(notification, myNotificationsState))
        .sort(dateSort('datePublished', 'desc')),
    [FOCUS.data.notifications, BRP.notifications, myNotificationsState]
  );

  const isLoading = BRP.isLoading || FOCUS.isLoading;
  const isError = BRP.isError || FOCUS.isError;
  const isDirty = BRP.isDirty && FOCUS.isDirty;
  const isPristine = BRP.isPristine && FOCUS.isPristine;

  return useMemo(
    () => ({
      isLoading,
      isError,
      isDirty,
      isPristine,
      errorMessage: '',
      data: {
        items,
        total: items.length,
      },
    }),
    [isLoading, isError, isDirty, isPristine, items]
  );
};

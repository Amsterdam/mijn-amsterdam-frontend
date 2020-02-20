import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import { Chapter } from 'config/Chapter.constants';
import { WelcomeNotification } from 'config/StaticData';
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

interface NotificationState {
  items: MyNotification[];
  total: number;
}

export type MyNotificationsApiState = ApiState<NotificationState>;

export function useMyNotificationsState() {
  return useLocalStorage('MELDINGEN', {});
}

// NOTE: Currently we only extract/construct notifications from the main focus api data which is not specifically tailored for this use.
// In the future we will get specifically tailored generic notification content from various api's which will be integrated in
// a domain wide notifications stream.
export default function useMyNotificationsApi({
  FOCUS,
  BRP,
  BELASTINGEN,
  MILIEUZONE,
}: AppState): MyNotificationsApiState {
  const items = useMemo(
    () =>
      [
        // Static content welcome message
        WelcomeNotification,
        // Focus notification items
        ...FOCUS.data.notifications,
        // BRP Notifications
        ...BRP.notifications,
        // Belastingen
        ...BELASTINGEN.data.notifications,
        // Milieuzones
        ...MILIEUZONE.data.notifications,
      ].sort(dateSort('datePublished', 'desc')),
    [
      FOCUS.data.notifications,
      BRP.notifications,
      BELASTINGEN.data.notifications,
      MILIEUZONE.data.notifications,
    ]
  );

  const isLoading =
    BRP.isLoading ||
    FOCUS.isLoading ||
    BELASTINGEN.isLoading ||
    MILIEUZONE.isLoading;
  const isError =
    BRP.isError || FOCUS.isError || BELASTINGEN.isError || MILIEUZONE.isError;
  const isDirty =
    BRP.isDirty && FOCUS.isDirty && BELASTINGEN.isDirty && MILIEUZONE.isDirty;
  const isPristine =
    BRP.isPristine &&
    FOCUS.isPristine &&
    BELASTINGEN.isPristine &&
    MILIEUZONE.isPristine;

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
}

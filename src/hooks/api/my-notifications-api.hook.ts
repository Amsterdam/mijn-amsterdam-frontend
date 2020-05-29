import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import { Chapter } from 'config/Chapter.constants';
import { WelcomeNotification } from 'config/StaticData';
import { dateSort } from 'helpers/App';
import { useLocalStorage } from 'hooks/storage.hook';
import { useMemo } from 'react';
import { ApiState } from './api.types';
import { dateFormat, defaultDateFormat } from '../../helpers/App';
import { MaintenanceNotification } from '../../config/StaticData';

export interface MyNotification {
  id: string;
  chapter: Chapter;
  datePublished: string;
  hideDatePublished?: boolean;
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
  return useLocalStorage('UPDATES', {});
}

function addChapterNamespaceToId(chapter: Chapter) {
  return (item: MyNotification) => ({
    ...item,
    id: `${chapter}-${item.id}`,
  });
}

// NOTE: Currently we only extract/construct notifications from the main focus api data which is not specifically tailored for this use.
// In the future we will get specifically tailored generic notification content from various api's which will be integrated in
// a domain wide notifications stream.
export default function useMyNotificationsApi({
  FOCUS,
  FOCUS_SPECIFICATIONS,
  BRP,
  BELASTINGEN,
  MILIEUZONE,
  FOCUS_TOZO,
}: AppState): MyNotificationsApiState {
  const items = useMemo(() => {
    const notifications = [
      // Static content welcome message
      WelcomeNotification,
      // Focus notification items
      ...FOCUS.data.notifications.map(addChapterNamespaceToId('INKOMEN')),
      ...FOCUS_SPECIFICATIONS.data.notifications.map(
        addChapterNamespaceToId('INKOMEN')
      ),
      // BRP Notifications
      ...BRP.notifications.map(addChapterNamespaceToId('BURGERZAKEN')),
      // Belastingen
      ...BELASTINGEN.data.notifications.map(
        addChapterNamespaceToId('BELASTINGEN')
      ),
      // Milieuzones
      ...MILIEUZONE.data.notifications.map(
        addChapterNamespaceToId('MILIEUZONE')
      ),
      // Focus TOZO
      ...(FOCUS_TOZO.data?.length
        ? FOCUS_TOZO.data.flatMap(
            item =>
              Object.values(item.notifications)
                .flatMap(x => x)
                .filter(
                  notification => notification !== null
                ) as MyNotification[]
          )
        : []),
    ];
    if (
      defaultDateFormat(MaintenanceNotification.datePublished) ===
      defaultDateFormat(new Date())
    ) {
      notifications.push(MaintenanceNotification);
    }
    return notifications.sort(dateSort('datePublished', 'desc'));
  }, [
    FOCUS.data.notifications,
    BRP.notifications,
    BELASTINGEN.data.notifications,
    MILIEUZONE.data.notifications,
    FOCUS_SPECIFICATIONS.data.notifications,
    FOCUS_TOZO.data,
  ]);

  const isLoading =
    BRP.isLoading ||
    FOCUS.isLoading ||
    FOCUS_TOZO.isLoading ||
    BELASTINGEN.isLoading ||
    MILIEUZONE.isLoading;
  const isError =
    BRP.isError ||
    FOCUS.isError ||
    BELASTINGEN.isError ||
    MILIEUZONE.isError ||
    FOCUS_TOZO.isError;
  const isDirty =
    BRP.isDirty &&
    FOCUS.isDirty &&
    BELASTINGEN.isDirty &&
    MILIEUZONE.isDirty &&
    FOCUS_TOZO.isDirty;
  const isPristine =
    BRP.isPristine &&
    FOCUS.isPristine &&
    FOCUS_TOZO.isPristine &&
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

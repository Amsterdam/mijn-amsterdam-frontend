import { useMemo } from 'react';

import { useAppStateStore } from './useAppStateStore';
import type { MyNotification } from '../../universal/types/App.types';
import { WelcomeNotification } from '../config/staticData';
import { getRedactedClass } from '../helpers/cobrowse';

export function useAppStateNotifications(top?: number) {
  const { isReady, NOTIFICATIONS } = useAppStateStore();
  const notifications_: MyNotification[] = NOTIFICATIONS?.content ?? [];
  // Merge the WelcomeNotification when AppState is ready.
  const notifications = useMemo(
    () =>
      (isReady ? [...notifications_, WelcomeNotification] : notifications_).map(
        (n) => ({
          ...n,
          className: n.isTip
            ? getRedactedClass(null, 'content') // Tips can contain information from multiple thema's. Redact by default
            : getRedactedClass(n.themaID, 'content'),
        })
      ),
    [isReady]
  );

  return {
    notifications: top ? notifications.slice(0, top) : notifications,
    total: notifications.length,
  };
}

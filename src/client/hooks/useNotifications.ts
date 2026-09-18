import { useMemo } from 'react';

import { useAppStateStore } from './useAppStateStore.ts';
import type { MyNotification } from '../../universal/types/App.types.ts';
import { WelcomeNotification } from '../apps/bob/config/staticData.tsx';
import { featureToggle } from '../apps/bob/pages/MyTips/MyTips-config.ts';
import { getRedactedClass } from '../helpers/cobrowse.ts';

export function useAppStateNotifications(top?: number) {
  const { isReady, NOTIFICATIONS } = useAppStateStore();
  const notifications_: MyNotification[] = NOTIFICATIONS?.content ?? [];
  // Merge the WelcomeNotification when AppState is ready.
  const notificationsWithWelcomeNotification = useMemo(
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

  if (!featureToggle.newTipsDesign) {
    return {
      notifications: top
        ? notificationsWithWelcomeNotification.slice(0, top)
        : notificationsWithWelcomeNotification,
      notificationsTotal: notificationsWithWelcomeNotification.length,
    };
  }

  // Seperate notifications and tips
  const notifications = notificationsWithWelcomeNotification.filter(
    (notification) => !notification.isTip
  );
  const tips = notifications_.filter((notification) => notification.isTip);

  return {
    notifications: top ? notifications.slice(0, top) : notifications,
    tips,
    tipsTotal: tips.length,
    notificationsTotal: notifications.length,
  };
}

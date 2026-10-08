import { useMemo } from 'react';

import { useAppStateStore } from './useAppStateStore.ts';
import type { MyNotification } from '../../universal/types/App.types.ts';
import { WelcomeNotification } from '../apps/bob/config/staticData.tsx';
import { themaConfig } from '../apps/bob/pages/MyTips/MyTips-config.ts';
import { getRedactedClass } from '../helpers/cobrowse.ts';

export function useAppStateNotifications(top?: number) {
  const { isReady, NOTIFICATIONS } = useAppStateStore();
  const notifications_: MyNotification[] = useMemo(
    () => NOTIFICATIONS?.content ?? [],
    [NOTIFICATIONS?.content]
  );
  // Merge the WelcomeNotification when AppState is ready.
  const notificationsWithWelcomeNotification = useMemo(
    () => (isReady ? [...notifications_, WelcomeNotification] : notifications_),
    [isReady, notifications_]
  );

  const notificationsWithRedactionClass = useMemo(
    () =>
      notificationsWithWelcomeNotification.map((n) => ({
        ...n,
        className: n.isTip
          ? getRedactedClass(null, 'content') // Tips can contain information from multiple thema's. Redact by default
          : getRedactedClass(n.themaID, 'content'),
      })),
    [notificationsWithWelcomeNotification]
  );

  if (!themaConfig.featureToggle.enableNewTipsDesign) {
    return {
      notifications: top
        ? notificationsWithRedactionClass.slice(0, top)
        : notificationsWithRedactionClass,
      notificationsTotal: notificationsWithRedactionClass.length,
    };
  }

  // Seperate notifications and tips
  const notifications = notificationsWithRedactionClass.filter(
    (notification) => !notification.isTip
  );
  const tips = notificationsWithRedactionClass.filter(
    (notification) => notification.isTip
  );

  return {
    notifications: top ? notifications.slice(0, top) : notifications,
    tips,
    tipsTotal: tips.length,
    notificationsTotal: notifications.length,
  };
}

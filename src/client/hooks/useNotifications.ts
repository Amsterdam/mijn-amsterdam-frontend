import { useMemo } from 'react';

import { useAppStateStore } from './useAppStateStore';
import type { MyNotification } from '../../universal/types/App.types';
import { useCobrowseScreenshareStatus } from '../components/MainFooter/CobrowseFooter/CobrowseFooter';
import { WelcomeNotification } from '../config/staticData';
import { getRedactedClass } from '../helpers/cobrowse';

export function useAppStateNotifications(top?: number) {
  const { isReady, NOTIFICATIONS } = useAppStateStore();
  const notifications_: MyNotification[] = NOTIFICATIONS?.content ?? [];
  const isCobrowseScreensharing = useCobrowseScreenshareStatus();
  // Merge the WelcomeNotification when AppState is ready.
  const notifications = useMemo(
    () =>
      (isReady ? [...notifications_, WelcomeNotification] : notifications_).map(
        (n) => ({
          ...n,
          className: n.isTip
            ? getRedactedClass({
                scopeRequested: 'content',
                isCobrowseScreensharing,
              }) // Tips can contain information from multiple thema's. Redact by default
            : getRedactedClass({
                themaId: n.themaID,
                scopeRequested: 'content',
                isCobrowseScreensharing,
              }),
        })
      ),
    [isReady]
  );

  return {
    notifications: top ? notifications.slice(0, top) : notifications,
    total: notifications.length,
  };
}

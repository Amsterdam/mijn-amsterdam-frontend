import { selectorFamily, useRecoilValue } from 'recoil';

import { appStateAtom } from './useAppState.ts';
import { useProfileTypeValue } from './useProfileType.ts';
import { WelcomeNotification } from '../config/staticData.tsx';

const appStateNotificationsSelector = selectorFamily({
  key: 'appStateNotifications',
  get:
    (profileType: ProfileType) =>
    ({ get }) => {
      const appState = get(appStateAtom);
      const notifications = appState.NOTIFICATIONS.content || [];

      return [...notifications, WelcomeNotification];
    },
});

export function useAppStateNotifications(top?: number) {
  const profileType = useProfileTypeValue();
  const notifications = useRecoilValue(
    appStateNotificationsSelector(profileType)
  );

  return {
    notifications: top ? notifications.slice(0, top) : notifications,
    total: notifications.length,
  };
}

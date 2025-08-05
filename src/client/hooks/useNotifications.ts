import { selectorFamily, useRecoilValue } from 'recoil';

import { appStateAtom } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { WelcomeNotification } from '../config/staticData';
import { getRedactedClass } from '../helpers/utils';

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
  ).map((n) => ({
    ...n,
    className: getRedactedClass(n.themaID, 'content'),
  }));

  return {
    notifications: top ? notifications.slice(0, top) : notifications,
    total: notifications.length,
  };
}

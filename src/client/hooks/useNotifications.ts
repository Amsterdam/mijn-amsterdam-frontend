import { selectorFamily, useRecoilValue } from 'recoil';
import {
  WelcomeNotification,
  WelcomeNotification2Commercial,
} from '../config/staticData';
import { appStateAtom } from './useAppState';
import { useProfileTypeValue } from './useProfileType';

const appStateNotificationsSelector = selectorFamily({
  key: 'appStateNotifications',
  get:
    (profileType: ProfileType) =>
    ({ get }) => {
      const appState = get(appStateAtom);
      let notifications = appState.NOTIFICATIONS.content || [];

      return [
        ...notifications,
        profileType === 'private'
          ? WelcomeNotification
          : WelcomeNotification2Commercial,
      ];
    },
});

export function useAppStateNotifications() {
  const profileType = useProfileTypeValue();
  const notifications = useRecoilValue(
    appStateNotificationsSelector(profileType)
  );

  return notifications;
}

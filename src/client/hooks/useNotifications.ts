import { selectorFamily, useRecoilValue } from 'recoil';
import {
  WelcomeNotification,
  WelcomeNotification2,
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
      let welcomeNotification = WelcomeNotification;

      if (appState.BRP?.content?.adres?.woonplaatsNaam === 'Weesp') {
        welcomeNotification =
          profileType === 'private'
            ? WelcomeNotification2
            : WelcomeNotification2Commercial;

        return [welcomeNotification, ...notifications];
      }

      return [...notifications, welcomeNotification];
    },
});

export function useAppStateNotifications() {
  const profileType = useProfileTypeValue();
  const notifications = useRecoilValue(
    appStateNotificationsSelector(profileType)
  );

  return notifications;
}

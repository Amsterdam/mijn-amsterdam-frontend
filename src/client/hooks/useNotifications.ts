import { selectorFamily, useRecoilValue } from 'recoil';
import { Chapters } from '../../universal/config';
import { dateSort } from '../../universal/helpers';
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
      const isLoggedInAsCompany = profileType === 'commercial';
      let notifications = appState.NOTIFICATIONS.content || [];

      // Exclude meldingen for the private-commercial (ZZP) profile.
      if (
        profileType === 'private-commercial' &&
        appState.NOTIFICATIONS.content
      ) {
        notifications = appState.NOTIFICATIONS.content.filter(
          (notification) =>
            notification.chapter !== Chapters.BRP &&
            notification.chapter !== Chapters.BURGERZAKEN
        );

        // If user is not logged in with EHK filter subsidie notifications.
        if (!isLoggedInAsCompany) {
          notifications = notifications.filter(
            (notification) => notification.chapter !== Chapters.SUBSIDIE
          );
        }
      }

      let welcomeNotification = WelcomeNotification;

      if (appState.BRP?.content?.adres?.woonplaatsNaam === 'Weesp') {
        welcomeNotification =
          profileType === 'private'
            ? WelcomeNotification2
            : WelcomeNotification2Commercial;

        let notificationsSorted = [welcomeNotification, ...notifications];

        notificationsSorted = notificationsSorted.sort(
          dateSort('datePublished', 'desc')
        );

        return notificationsSorted;
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

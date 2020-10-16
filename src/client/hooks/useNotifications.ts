import { selectorFamily, useRecoilValue } from 'recoil';
import { Chapters } from '../../universal/config';
import { appStateAtom } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { WelcomeNotification } from '../config/staticData';

const appStateNotificationsSelector = selectorFamily({
  key: 'appStateNotifications',
  get: (profileType: ProfileType) => ({ get }) => {
    const appState = get(appStateAtom);
    let notifications = appState.NOTIFICATIONS.content || [];
    if (
      profileType === 'private-commercial' &&
      appState.NOTIFICATIONS.content
    ) {
      notifications = appState.NOTIFICATIONS.content.filter(
        notification =>
          notification.chapter !== Chapters.BRP &&
          notification.chapter !== Chapters.BURGERZAKEN
      );
    }

    return [...notifications, WelcomeNotification];
  },
});

export function useAppStateNotifications() {
  const profileType = useProfileTypeValue();
  return useRecoilValue(appStateNotificationsSelector(profileType));
}

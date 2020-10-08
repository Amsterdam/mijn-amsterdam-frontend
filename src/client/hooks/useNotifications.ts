import { selectorFamily, useRecoilValue } from 'recoil';
import { Chapters } from '../../universal/config';
import { appStateAtom } from './useAppState';
import { useProfileTypeValue } from './useProfileType';

const appStateNotificationsSelector = selectorFamily({
  key: 'appStateNotifications',
  get: (profileType: ProfileType) => ({ get }) => {
    const appState = get(appStateAtom);

    if (
      profileType === 'private-commercial' &&
      appState.NOTIFICATIONS.content
    ) {
      return appState.NOTIFICATIONS.content.filter(
        notification =>
          notification.chapter !== Chapters.BRP &&
          notification.chapter !== Chapters.BURGERZAKEN
      );
    }

    return appState.NOTIFICATIONS.content || [];
  },
});

export function useAppStateNotifications() {
  const profileType = useProfileTypeValue();
  return useRecoilValue(appStateNotificationsSelector(profileType));
}

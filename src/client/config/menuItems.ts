import { myThemasMenuItems } from './thema';
import { ThemaMenuItemTransformed, ThemaMenuItem } from './thema-types';
import type { AppState } from '../../universal/types/App.types';
import { useAppStateGetter } from '../hooks/useAppStateStore';

export function useThemasByProfileType(
  profileType: ProfileType
): ThemaMenuItemTransformed[] {
  const appState = useAppStateGetter();
  return {
    private: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private'))
      .map((item) => getThemaMenuItem(appState, item, 'private')),
    'private-attributes': myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private-attributes'))
      .map((item) => getThemaMenuItem(appState, item, 'private-attributes')),
    commercial: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('commercial'))
      .map((item) => getThemaMenuItem(appState, item, 'commercial')),
  }[profileType || 'private'];
}

function getThemaMenuItem(
  appState: AppState,
  item: ThemaMenuItem,
  profileType: ProfileType
) {
  const title =
    typeof item.title === 'function'
      ? item.title(appState, profileType)
      : item.title;
  return {
    ...item,
    title,
    to:
      typeof item.to === 'function' ? item.to(appState, profileType) : item.to,
    isActive: !!(item.isActive
      ? item.isActive(appState)
      : item.isAlwaysVisible),
  };
}

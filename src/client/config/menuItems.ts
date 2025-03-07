import {
  ThemaMenuItem,
  ThemaMenuItemTransformed,
  myThemasMenuItems,
} from './thema';
import { useAppStateGetter } from '../hooks/useAppState';
import { termReplace } from '../hooks/useTermReplacement';

export const themasByProfileType: (
  profileType: ProfileType
) => ThemaMenuItemTransformed[] = (profileType) =>
  ({
    private: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private'))
      .map((item) => buildThemaMenuItem(item, 'private')),
    'private-attributes': myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private-attributes'))
      .map((item) => buildThemaMenuItem(item, 'private-attributes')),
    commercial: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('commercial'))
      .map((item) => buildThemaMenuItem(item, 'commercial')),
  })[profileType];

function buildThemaMenuItem(item: ThemaMenuItem, profileType: ProfileType) {
  const appState = useAppStateGetter();
  return {
    ...item,
    title: termReplace(
      profileType,
      typeof item.title === 'function' ? item.title(appState) : item.title
    ),
    to: typeof item.to === 'function' ? item.to(appState) : item.to,
  };
}

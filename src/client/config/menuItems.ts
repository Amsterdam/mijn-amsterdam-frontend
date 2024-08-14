import { useAppStateGetter } from '../hooks/useAppState';
import { termReplace } from '../hooks/useTermReplacement';
import { ThemaMenuItem, myThemasMenuItems } from './thema';

export const themasByProfileType: (
  profileType: ProfileType
) => ThemaMenuItem[] = (profileType) =>
  ({
    private: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private'))
      .map(buildThemaMenuItem),
    'private-attributes': myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private-attributes'))
      .map(buildThemaMenuItem),
    commercial: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('commercial'))
      .map(buildThemaMenuItem),
  })[profileType];

function buildThemaMenuItem(item: ThemaMenuItem) {
  const appState = useAppStateGetter();
  return {
    ...item,
    title: termReplace(
      'commercial',
      typeof item.title === 'function' ? item.title(appState) : item.title
    ),
    to: typeof item.to === 'function' ? item.to(appState) : item.to,
  };
}

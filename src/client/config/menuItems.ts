import { myThemasMenuItems } from './thema';
import { ThemaMenuItemTransformed, ThemaMenuItem } from './thema-types';
import { useAppStateGetter } from '../hooks/useAppStateStore';

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
  })[profileType || 'private'];

function buildThemaMenuItem(item: ThemaMenuItem, profileType: ProfileType) {
  const appState = useAppStateGetter();
  const title =
    typeof item.title === 'function'
      ? item.title(appState, profileType)
      : item.title;
  return {
    ...item,
    title,
    to:
      typeof item.to === 'function' ? item.to(appState, profileType) : item.to,
  };
}

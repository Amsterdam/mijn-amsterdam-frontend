import { ThemaMenuItem, myThemasMenuItems } from '../../universal/config';
import { AppState } from '../AppState';
import { termReplace } from '../hooks/useTermReplacement';

export const themasByProfileType: (
  profileType: ProfileType,
  appState: AppState
) => ThemaMenuItem[] = (profileType, appState) =>
  ({
    private: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private'))
      .map((item) => {
        return {
          ...item,
          title: termReplace(
            'private',
            typeof item.title === 'function' ? item.title(appState) : item.title
          ),
        };
      }),
    'private-attributes': myThemasMenuItems
      .filter((item) => item.profileTypes.includes('private-attributes'))
      .map((item) => {
        return {
          ...item,
          title: termReplace(
            'private-attributes',
            typeof item.title === 'function' ? item.title(appState) : item.title
          ),
        };
      }),
    commercial: myThemasMenuItems
      .filter((item) => item.profileTypes.includes('commercial'))
      .map((item) => {
        return {
          ...item,
          title: termReplace(
            'commercial',
            typeof item.title === 'function' ? item.title(appState) : item.title
          ),
        };
      }),
  })[profileType];

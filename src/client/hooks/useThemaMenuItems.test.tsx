import { Themas } from '../../universal/config/thema';
import { ThemaTitles } from '../config/thema';
import { ThemaMenuItem } from '../config/thema-types';
import { getThemaMenuItemsAppState, isThemaActive } from '../helpers/themas';

describe('useThemaMenuItems', () => {
  test('Parkeren is not active without an Appstate entry.', () => {
    const item: ThemaMenuItem = {
      title: ThemaTitles.PARKEREN,
      id: Themas.PARKEREN,
      to: 'http://test',
      rel: 'external',
      profileTypes: ['private', 'commercial'],
    };

    const isActive = isThemaActive(item, {
      TEST: { content: 'foo', status: 'OK' },
      BRP: { content: { persoon: { mokum: true } } },
      PARKEREN: { content: { isKnown: false }, status: 'OK' },
    } as any);

    expect(isActive).toBe(false);
  });

  test('getThemaMenuItemsAppState', () => {
    const appState = {
      TEST: { content: 'foo', status: 'OK' },
      BRP: { content: { persoon: { mokum: true } }, status: 'OK' },
    } as any;

    const items: ThemaMenuItem[] = [
      {
        id: 'BRP',
        profileTypes: ['private'],
        to: 'http://test',
        title: 'Testje!',
      },
      {
        id: 'PARKEREN',
        hasAppStateValue: false,
        profileTypes: ['private'],
        to: 'http://test',
        title: 'Testje!',
      },
    ];

    expect(getThemaMenuItemsAppState(appState, items)).toStrictEqual([
      appState.BRP,
    ]);
  });
});

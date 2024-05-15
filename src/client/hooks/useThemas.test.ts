import { ThemaMenuItem } from '../config/menuItems';
import {
  getThemaMenuItemsAppState,
  isThemaActive,
} from '../../universal/helpers/themas';

describe('useThemas', () => {
  test('isThemaActive (No AppState Value)', () => {
    const item: ThemaMenuItem = {
      id: 'PARKEREN',
      hasAppStateValue: false,
      profileTypes: ['private'],
      to: 'http://test',
      title: 'Testje!',
    };

    const isActive = isThemaActive(item, {
      TEST: { content: 'foo', status: 'OK' },
      BRP: { content: { persoon: { mokum: true } } },
    } as any);

    expect(isActive).toBe(true);
  });

  test('isThemaActive', () => {
    const item: ThemaMenuItem = {
      id: 'BRP',
      profileTypes: ['private'],
      to: 'http://test',
      title: 'Testje!',
    };

    {
      const isActive = isThemaActive(item, {
        BRP: { content: { persoon: null } },
      } as any);

      expect(isActive).toBe(false);
    }

    {
      const isActive = isThemaActive(item, {
        BRP: { content: { persoon: { naam: 'testje' } } },
      } as any);

      expect(isActive).toBe(true);
    }
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

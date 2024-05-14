import { ChapterMenuItem } from '../config/menuItems';
import {
  getChapterMenuItemsAppState,
  isChapterActive,
} from '../../universal/helpers/themas';

describe('useThemas', () => {
  test('isChapterActive (No AppState Value)', () => {
    const item: ChapterMenuItem = {
      id: 'PARKEREN',
      hasAppStateValue: false,
      profileTypes: ['private'],
      to: 'http://test',
      title: 'Testje!',
    };

    const isActive = isChapterActive(item, {
      TEST: { content: 'foo', status: 'OK' },
      BRP: { content: { persoon: { mokum: true } } },
    } as any);

    expect(isActive).toBe(true);
  });

  test('isChapterActive', () => {
    const item: ChapterMenuItem = {
      id: 'BRP',
      profileTypes: ['private'],
      to: 'http://test',
      title: 'Testje!',
    };

    {
      const isActive = isChapterActive(item, {
        BRP: { content: { persoon: null } },
      } as any);

      expect(isActive).toBe(false);
    }

    {
      const isActive = isChapterActive(item, {
        BRP: { content: { persoon: { naam: 'testje' } } },
      } as any);

      expect(isActive).toBe(true);
    }
  });

  test('getChapterMenuItemsAppState', () => {
    const appState = {
      TEST: { content: 'foo', status: 'OK' },
      BRP: { content: { persoon: { mokum: true } }, status: 'OK' },
    } as any;

    const items: ChapterMenuItem[] = [
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

    expect(getChapterMenuItemsAppState(appState, items)).toStrictEqual([
      appState.BRP,
    ]);
  });
});

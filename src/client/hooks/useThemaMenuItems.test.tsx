import { ThemaMenuItem } from '../config/thema-types';
import { getThemaMenuItemsAppState, isThemaActive } from '../helpers/themas';
import {
  themaId as themaIdParkeren,
  themaTitle as themaTitleParkeren,
} from '../pages/Thema/Parkeren/Parkeren-thema-config';
import { themaIdBRP } from '../pages/Thema/Profile/Profile-thema-config';

describe('useThemaMenuItems', () => {
  test('Parkeren is not active without an Appstate entry.', () => {
    const item: ThemaMenuItem = {
      title: themaTitleParkeren,
      id: themaIdParkeren,
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
        id: themaIdBRP,
        profileTypes: ['private'],
        to: 'http://test',
        title: 'Testje!',
      },
      {
        id: themaIdParkeren,
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

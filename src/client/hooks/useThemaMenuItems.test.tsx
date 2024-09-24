import { Themas } from '../../universal/config/thema';
import { ThemaMenuItem, ThemaTitles } from '../config/thema';
import { getThemaMenuItemsAppState, isThemaActive } from '../config/themas';
import { renderHook, act } from '@testing-library/react';
import { useThemaMenuItems } from './useThemaMenuItems';
import { trackEvent } from '../utils/monitoring';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { ReactNode } from 'react';
import { appStateAtom } from './useAppState';
import { AppState } from '../../universal/types';

vi.mock('../utils/monitoring', () => ({
  trackEvent: vi.fn(),
}));

describe('useThemaMenuItems', () => {
  test('Parkeren is not active without an Appstate entry.', () => {
    const item: ThemaMenuItem = {
      title: ThemaTitles.Parkeren,
      id: Themas.PARKEREN,
      to: 'http://test',
      rel: 'external',
      profileTypes: ['private', 'commercial'],
    };

    const isActive = isThemaActive(item, {
      TEST: { content: 'foo', status: 'OK' },
      BRP: { content: { persoon: { mokum: true } } },
    } as any);

    expect(isActive).toBe(false);
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

  test('trackEvent is called with the correct arguments', () => {
    const testState = {
      AFIS: {
        status: 'OK',
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: 'yyy-456-yyy',
        },
      },
      PARKEREN: {
        status: 'OK',
        content: {
          url: 'http://localhost:3000/afspraak-maken',
        },
      },
    } as AppState;

    function initializeState(snapshot: MutableSnapshot) {
      snapshot.set(appStateAtom, testState);
    }

    const mockApp = ({ children }: { children: ReactNode }) => (
      <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
    );

    renderHook(() => useThemaMenuItems(), {
      wrapper: mockApp,
    });

    expect(trackEvent).toHaveBeenCalledWith('themas-per-sessie', {
      themas: [
        {
          id: 'AFIS',
          title: 'Facturen en betalen',
        },
        {
          id: 'PARKEREN',
          title: 'Parkeren',
        },
      ],
    });
  });
});

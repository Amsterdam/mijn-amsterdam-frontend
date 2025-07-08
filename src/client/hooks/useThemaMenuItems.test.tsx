import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router';
import { RecoilRoot } from 'recoil';
import { describe, it, expect, vi, Mock } from 'vitest';

import { useAppStateGetter, useAppStateReady } from './useAppState.ts';
import { useProfileTypeValue } from './useProfileType.ts';
import {
  useThemaBreadcrumbs,
  useThemaMenuItemByThemaID,
  useThemaMenuItems,
  useThemaMenuItemsByThemaID,
} from './useThemaMenuItems.ts';
import { themasByProfileType } from '../config/menuItems.ts';
import type { ThemaMenuItemTransformed } from '../config/thema-types.ts';

vi.mock('./useProfileType', () => ({
  useProfileTypeValue: vi.fn(),
}));

vi.mock('./useAppState', () => ({
  useAppStateGetter: vi.fn(),
  useAppStateReady: vi.fn(),
}));

vi.mock('../config/menuItems', () => ({
  themasByProfileType: vi.fn(),
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
}));

describe('useThemaMenuItems', () => {
  it('should return filtered and sorted thema items based on profile type', () => {
    const mockProfileType = 'private';
    const mockAppState = { someKey: 'someValue' };
    const mockThemaItems: ThemaMenuItemTransformed[] = [
      {
        id: '1',
        title: 'Thema A',
        isActive: () => true,
        to: '',
        profileTypes: [mockProfileType],
      },
      {
        id: '2',
        title: 'Thema B',
        isActive: () => false,
        to: '',
        profileTypes: [mockProfileType],
      },
      {
        id: '3',
        title: 'Thema C',
        isAlwaysVisible: false,
        to: '',
        profileTypes: [mockProfileType],
      },
      {
        id: '4',
        title: 'Thema D',
        isActive: () => true,
        to: '',
        profileTypes: [],
      },
      {
        id: '5',
        title: 'Thema E',
        isAlwaysVisible: true,
        to: '',
        profileTypes: [mockProfileType],
      },
    ];

    (useProfileTypeValue as Mock).mockReturnValue(mockProfileType);
    (useAppStateGetter as Mock).mockReturnValue(mockAppState);
    (useAppStateReady as Mock).mockReturnValue(true);
    (themasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useThemaMenuItems(), {
      wrapper: ({ children }) => <RecoilRoot>{children}</RecoilRoot>,
    });

    expect(result.current.items.map((item) => item.id)).toEqual([
      '1',
      '4',
      '5',
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return isLoading as true when app state is not ready', () => {
    (useAppStateReady as Mock).mockReturnValue(false);
    (themasByProfileType as Mock).mockReturnValue([]);

    const { result } = renderHook(() => useThemaMenuItems());

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useThemaMenuItemsByThemaID', () => {
  it('should return a map of thema items by ID', () => {
    const itemA = {
      id: '1',
      title: 'Thema A',
      isActive: () => true,
      isAlwaysVisible: false,
      to: '',
      profileTypes: [],
    };
    const itemB = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '',
      profileTypes: [],
    };
    const mockThemaItems: ThemaMenuItemTransformed[] = [itemA, itemB];

    (themasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useThemaMenuItemsByThemaID());

    expect(result.current).toEqual({
      '1': itemA,
      '2': itemB,
    });
  });
});

describe('useThemaMenuItemByThemaID', () => {
  it('should return the correct thema item by ID', () => {
    const itemA = {
      id: '1',
      title: 'Thema A',
      isActive: () => true,
      isAlwaysVisible: false,
      to: '',
      profileTypes: [],
    };
    const itemB = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '',
      profileTypes: [],
    };
    const mockThemaItems: ThemaMenuItemTransformed[] = [itemA, itemB];

    (themasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useThemaMenuItemByThemaID('1'));

    expect(result.current).toEqual(itemA);
  });

  it('should return null if the ID does not exist', () => {
    const itemB = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '',
      profileTypes: [],
    };
    const mockThemaItems: ThemaMenuItemTransformed[] = [itemB];

    (themasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useThemaMenuItemByThemaID('3'));

    expect(result.current).toBeNull();
  });
});

describe('useThemaBreadcrumbs', () => {
  it('should return breadcrumbs with a list entry for a valid thema ID', () => {
    const mockLocation = { state: { from: '/list', pageType: 'listpage' } };

    const itemB = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '/thema-b',
      profileTypes: [],
    };

    const mockThemaItems: ThemaMenuItemTransformed[] = [itemB];

    (themasByProfileType as Mock).mockReturnValue(mockThemaItems);
    (useLocation as Mock).mockReturnValue(mockLocation);

    const { result } = renderHook(() => useThemaBreadcrumbs('2'));

    expect(result.current).toEqual([
      { to: '/thema-b', title: 'Thema B' },
      { to: '/list', title: 'Lijst' },
    ]);
  });

  it('should return breadcrumbs without "Lijst" if pageType is not "listpage"', () => {
    const mockLocation = { state: { from: '/list', pageType: 'none' } };

    const itemB = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '/thema-b',
      profileTypes: [],
    };

    const mockThemaItems: ThemaMenuItemTransformed[] = [itemB];

    (themasByProfileType as Mock).mockReturnValue(mockThemaItems);
    (useLocation as Mock).mockReturnValue(mockLocation);

    const { result } = renderHook(() => useThemaBreadcrumbs('2'));

    expect(result.current).toEqual([{ to: '/thema-b', title: 'Thema B' }]);
  });

  it('should return an empty array if no thema item is found', () => {
    const mockLocation = { state: { from: '/x-list', pageType: 'listpage' } };

    (themasByProfileType as Mock).mockReturnValue([]);
    (useLocation as Mock).mockReturnValue(mockLocation);

    const { result } = renderHook(() => useThemaBreadcrumbs('3'));

    expect(result.current).toEqual([]);
  });
});

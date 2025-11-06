import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router';
import { describe, it, expect, vi, Mock } from 'vitest';

import { useAppStateGetter, useAppStateReady } from './useAppStateStore';
import { useProfileTypeValue } from './useProfileType';
import {
  compareThemas,
  useThemaBreadcrumbs,
  useThemaMenuItemByThemaID,
  useActiveThemaMenuItems,
  useAllThemaMenuItemsByThemaID,
} from './useThemaMenuItems';
import { useThemasByProfileType } from '../config/menuItems';
import type { ThemaMenuItemTransformed } from '../config/thema-types';

vi.mock('./useProfileType', () => ({
  useProfileTypeValue: vi.fn(),
}));

vi.mock('./useAppStateStore', () => ({
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

describe('compareThemas', () => {
  test('Sorts alphabeticaly and puts certain themaIDs on top', () => {
    const themas = [
      { id: '5', title: 'E' },
      { id: '4', title: 'D' },
      { id: '3', title: 'C' },
      { id: '2', title: 'B' },
      { id: 'KVK', title: 'Mijn onderneming' },
      { id: '1', title: 'A' },
      { id: 'BRP', title: 'Mijn gegevens' },
    ] as ThemaMenuItemTransformed[];
    themas.sort(compareThemas);
    expect(themas.map((thema) => thema.id)).toStrictEqual([
      'BRP',
      'KVK',
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });
});

describe('useActiveThemaMenuItems', () => {
  it('should return filtered and sorted thema items based on profile type', () => {
    const mockProfileType = 'private';
    const mockAppState = { someKey: 'someValue' };
    const mockThemaItems: ThemaMenuItemTransformed[] = [
      {
        id: '1',
        title: 'Thema A',
        isActive: true,
        to: '',
        profileTypes: [mockProfileType],
        redactedScope: 'none',
      },
      {
        id: '2',
        title: 'Thema B',
        isActive: false,
        to: '',
        profileTypes: [mockProfileType],
        redactedScope: 'none',
      },
      {
        id: '3',
        title: 'Thema C',
        isAlwaysVisible: false,
        to: '',
        profileTypes: [mockProfileType],
        redactedScope: 'none',
        isActive: false,
      },
      {
        id: '4',
        title: 'Thema D',
        isActive: true,
        to: '',
        profileTypes: [],
        redactedScope: 'none',
      },
      {
        id: '5',
        title: 'Thema E',
        isAlwaysVisible: true,
        to: '',
        profileTypes: [mockProfileType],
        redactedScope: 'none',
        isActive: true,
      },
    ];

    (useProfileTypeValue as Mock).mockReturnValue(mockProfileType);
    (useAppStateGetter as Mock).mockReturnValue(mockAppState);
    (useAppStateReady as Mock).mockReturnValue(true);
    (useThemasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useActiveThemaMenuItems(), {
      wrapper: ({ children }) => <>{children}</>,
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
    (useThemasByProfileType as Mock).mockReturnValue([]);

    const { result } = renderHook(() => useActiveThemaMenuItems());

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useAllThemaMenuItemsByThemaID', () => {
  it('should return a map of thema items by ID', () => {
    const itemA: ThemaMenuItemTransformed = {
      id: '1',
      title: 'Thema A',
      isActive: true,
      isAlwaysVisible: false,
      to: '',
      profileTypes: [],
      redactedScope: 'none',
    };
    const itemB: ThemaMenuItemTransformed = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '',
      profileTypes: [],
      redactedScope: 'none',
      isActive: false,
    };
    const itemC: ThemaMenuItemTransformed = {
      id: '3',
      title: 'Thema C',
      isAlwaysVisible: false,
      isActive: false,
      to: '',
      profileTypes: [],
      redactedScope: 'none',
    };
    const mockThemaItems: ThemaMenuItemTransformed[] = [itemA, itemB, itemC];

    (useThemasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useAllThemaMenuItemsByThemaID());

    expect(result.current).toEqual({
      '1': itemA,
      '2': itemB,
      '3': itemC,
    });
  });
});

describe('useThemaMenuItemByThemaID', () => {
  it('should return the correct thema item by ID', () => {
    const itemA: ThemaMenuItemTransformed = {
      id: '1',
      title: 'Thema A',
      isActive: true,
      isAlwaysVisible: false,
      to: '',
      profileTypes: [],
      redactedScope: 'none',
    };
    const itemB: ThemaMenuItemTransformed = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '',
      profileTypes: [],
      redactedScope: 'none',
      isActive: false,
    };
    const mockThemaItems: ThemaMenuItemTransformed[] = [itemA, itemB];

    (useThemasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useThemaMenuItemByThemaID('1'));

    expect(result.current).toEqual(itemA);
  });

  it('should return null if the ID does not exist', () => {
    const itemB: ThemaMenuItemTransformed = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '',
      profileTypes: [],
      redactedScope: 'none',
      isActive: false,
    };
    const mockThemaItems: ThemaMenuItemTransformed[] = [itemB];

    (useThemasByProfileType as Mock).mockReturnValue(mockThemaItems);

    const { result } = renderHook(() => useThemaMenuItemByThemaID('3'));

    expect(result.current).toBeNull();
  });
});

describe('useThemaBreadcrumbs', () => {
  it('should return breadcrumbs with a list entry for a valid thema ID', () => {
    const mockLocation = { state: { from: '/list', pageType: 'listpage' } };

    const itemB: ThemaMenuItemTransformed = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '/thema-b',
      profileTypes: [],
      redactedScope: 'none',
      isActive: false,
    };

    const mockThemaItems: ThemaMenuItemTransformed[] = [itemB];

    (useThemasByProfileType as Mock).mockReturnValue(mockThemaItems);
    (useLocation as Mock).mockReturnValue(mockLocation);

    const { result } = renderHook(() => useThemaBreadcrumbs('2'));

    expect(result.current).toEqual([
      { to: '/thema-b', title: 'Thema B' },
      { to: '/list', title: 'Lijst' },
    ]);
  });

  it('should return breadcrumbs without "Lijst" if pageType is not "listpage"', () => {
    const mockLocation = { state: { from: '/list', pageType: 'none' } };

    const itemB: ThemaMenuItemTransformed = {
      id: '2',
      title: 'Thema B',
      isAlwaysVisible: true,
      to: '/thema-b',
      profileTypes: [],
      redactedScope: 'none',
      isActive: false,
    };

    const mockThemaItems: ThemaMenuItemTransformed[] = [itemB];

    (useThemasByProfileType as Mock).mockReturnValue(mockThemaItems);
    (useLocation as Mock).mockReturnValue(mockLocation);

    const { result } = renderHook(() => useThemaBreadcrumbs('2'));

    expect(result.current).toEqual([{ to: '/thema-b', title: 'Thema B' }]);
  });

  it('should return an empty array if no thema item is found', () => {
    const mockLocation = { state: { from: '/x-list', pageType: 'listpage' } };

    (useThemasByProfileType as Mock).mockReturnValue([]);
    (useLocation as Mock).mockReturnValue(mockLocation);

    const { result } = renderHook(() => useThemaBreadcrumbs('3'));

    expect(result.current).toEqual([]);
  });
});

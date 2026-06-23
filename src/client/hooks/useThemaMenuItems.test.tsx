import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import { describe, it, expect, vi } from 'vitest';

import { useAppStateGetter, useAppStateReady } from './useAppStateStore.ts';
import { useProfileTypeValue } from './useProfileType.ts';
import {
  compareThemas,
  useThemaMenuItemByThemaID,
  useActiveThemaMenuItems,
  useAllThemaMenuItemsByThemaID,
} from './useThemaMenuItems.ts';
import { useThemasByProfileType } from '../config/menuItems.ts';
import type { ThemaMenuItemTransformed } from '../config/thema-types.ts';

vi.mock('./useProfileType', () => ({
  useProfileTypeValue: vi.fn(),
}));

vi.mock('./useAppStateStore', () => ({
  useAppStateGetter: vi.fn(),
  useAppStateReady: vi.fn(),
}));

vi.mock('../config/menuItems', () => ({
  useThemasByProfileType: vi.fn(),
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

import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router';
import type { Mock } from 'vitest';
import { describe, it, expect } from 'vitest';

import { useThemaBreadcrumbs } from './useThemaBreadcrumbs.ts';
import { useThemasByProfileType } from '../config/menuItems.ts';
import type { ThemaMenuItemTransformed } from '../config/thema-types.ts';

vi.mock('../config/menuItems', () => ({
  useThemasByProfileType: vi.fn(),
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
}));

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

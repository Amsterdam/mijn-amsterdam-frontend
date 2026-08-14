import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDisplayPropsEntries } from './useDisplayPropEntries.hook.ts';

const mockUseSmallScreen = vi.fn();
const mockGetDisplayPropsColWidths = vi.fn();
const mockGetDisplayProps = vi.fn();
const mockGetColWidth = vi.fn();

vi.mock('../../hooks/media.hook.ts', () => ({
  useSmallScreen: () => mockUseSmallScreen(),
}));

vi.mock('./helpers.ts', () => ({
  getDisplayPropsColWidths: (...args: unknown[]) =>
    mockGetDisplayPropsColWidths(...args),
  getDisplayProps: (...args: unknown[]) => mockGetDisplayProps(...args),
  getColWidth: (...args: unknown[]) => mockGetColWidth(...args),
}));

describe('useDisplayPropsEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all display prop entries when no screen-size config is present', () => {
    mockUseSmallScreen.mockReturnValue(false);
    mockGetDisplayPropsColWidths.mockReturnValue(undefined);
    mockGetDisplayProps.mockReturnValue({
      title: 'Titel',
      status: 'Status',
    });

    const { result } = renderHook(() => useDisplayPropsEntries({} as never));

    expect(result.current).toEqual([
      ['title', { label: 'Titel', width: undefined }],
      ['status', { label: 'Status', width: undefined }],
    ]);
  });

  it('filters hidden props for small screens and keeps string widths', () => {
    mockUseSmallScreen.mockReturnValue(true);
    mockGetDisplayProps.mockReturnValue({
      title: 'Titel',
      status: 'Status',
      date: 'Datum',
    });
    mockGetDisplayPropsColWidths.mockReturnValue({
      small: ['1fr', '0', true],
      large: ['2fr', '1fr', '1fr'],
    });
    mockGetColWidth.mockImplementation(
      (
        config: { small: unknown[]; large: unknown[] },
        screen: 'small' | 'large',
        index: number
      ) => config[screen][index]
    );

    const { result } = renderHook(() => useDisplayPropsEntries({} as never));

    expect(result.current).toEqual([
      ['title', { label: 'Titel', width: '1fr' }],
      ['date', { label: 'Datum', width: '0' }],
    ]);
  });
});

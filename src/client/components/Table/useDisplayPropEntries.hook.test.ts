import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DisplayProps } from './TableV2.types.ts';
import { useDisplayPropsEntries } from './useDisplayPropEntries.hook.ts';
import type { AfisFactuurFrontend } from '../../pages/Thema/Afis/Afis-thema-config.ts';

const mockUseSmallScreen = vi.fn();

const displayFixture: DisplayProps<AfisFactuurFrontend> = {
  props: {
    factuurNummerEl: 'Factuurnummer',
    statusDescription: 'Status',
  },
  colWidths: {
    large: ['75%', '25%'],
    small: ['100%', '0'],
  },
};

vi.mock('../../hooks/media.hook.ts', () => ({
  useSmallScreen: () => mockUseSmallScreen(),
}));

describe('useDisplayPropsEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all display prop entries when no screen-size config is present', () => {
    const { result } = renderHook(() =>
      useDisplayPropsEntries<DisplayProps<AfisFactuurFrontend>>(displayFixture)
    );

    expect(result.current).toEqual([
      ['factuurNummerEl', { label: 'Factuurnummer', width: '75%' }],
      ['statusDescription', { label: 'Status', width: '25%' }],
    ]);
  });

  it('filters hidden props for small screens and keeps string widths', () => {
    mockUseSmallScreen.mockReturnValue(true);

    const { result } = renderHook(() =>
      useDisplayPropsEntries<DisplayProps<AfisFactuurFrontend>>(displayFixture)
    );

    expect(result.current).toEqual([
      ['factuurNummerEl', { label: 'Factuurnummer', width: '100%' }],
    ]);
  });
});

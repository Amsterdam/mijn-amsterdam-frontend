import { describe, expect, it } from 'vitest';

import { getVisibleColumnConfigValue } from './helpers.ts';
import type { DisplayPropsViewConfig } from './TableV2.types.ts';

describe('getColWidth', () => {
  it('filters out "0" values and returns width by visible index', () => {
    const config = {
      small: ['1fr', '0', '2fr'],
      large: ['3fr', '4fr', '5fr'],
    } as unknown as DisplayPropsViewConfig;

    expect(getVisibleColumnConfigValue(config, 'small', 0)).toBe('1fr');
    expect(getVisibleColumnConfigValue(config, 'small', 1)).toBe('2fr');
  });

  it('keeps true values, filters false values', () => {
    const config = {
      small: [true, '1fr', false, '2fr'],
      large: ['3fr', '4fr', '5fr', '6fr'],
    } as unknown as DisplayPropsViewConfig;

    expect(getVisibleColumnConfigValue(config, 'small', 0)).toBe(true);
    expect(getVisibleColumnConfigValue(config, 'small', 1)).toBe('1fr');
    expect(getVisibleColumnConfigValue(config, 'small', 2)).toBe('2fr');
  });

  it('returns undefined when index is out of range', () => {
    const config = {
      small: ['1fr', '0'],
      large: ['2fr', '3fr'],
    } as unknown as DisplayPropsViewConfig;

    expect(getVisibleColumnConfigValue(config, 'small', 5)).toBeUndefined();
  });
});

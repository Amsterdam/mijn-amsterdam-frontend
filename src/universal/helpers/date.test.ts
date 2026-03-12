import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../server/logging', () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { parseDateToISO } from './date';
import { logger } from '../../server/logging';

describe('parseDateToIso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty string for null/undefined/empty input', () => {
    expect(parseDateToISO('')).toBe('');
    expect(parseDateToISO(null as unknown as string)).toBe('');
    expect(parseDateToISO(undefined as unknown as string)).toBe('');

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns an empty string and logs an error for invalid input', () => {
    expect(parseDateToISO('not-a-date')).toBe('');

    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it.each<[string, string]>([
    ['2024-01-01', '2024-01-01T00:00:00.000Z'],
    ['2024-01-01T12:00:00.000Z', '2024-01-01T12:00:00.000Z'],
    ['2024-01-01T12:00:00', '2024-01-01T11:00:00.000Z'],
  ])('parses %s to an ISO string', (input, expected) => {
    expect(parseDateToISO(input)).toBe(expected);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('takes into account daylight saving summer time', () => {
    expect(parseDateToISO('2024-04-01T12:00:00.000')).toBe(
      '2024-04-01T10:00:00.000Z'
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});

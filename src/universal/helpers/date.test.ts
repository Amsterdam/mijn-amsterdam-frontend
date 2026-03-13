import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../server/logging', () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { parseDateAndDateTime } from './date';
import { logger } from '../../server/logging';

describe('parseDateToIso', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('returns null for null/undefined/empty input', () => {
    expect(parseDateAndDateTime('')).toBeNull();
    expect(parseDateAndDateTime(null as unknown as string)).toBeNull();
    expect(parseDateAndDateTime(undefined as unknown as string)).toBeNull();

    expect(logger.error).not.toHaveBeenCalled();
  });

  it('returns an empty string and logs an error for invalid input', () => {
    expect(parseDateAndDateTime('not-a-date')).toBe(null);

    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it.each<[string, string]>([
    ['2024-01-01', '2024-01-01'],
    ['2024-01-01T12:00:00.000Z', '2024-01-01T12:00:00.000Z'],
    ['2024-01-01T12:00:00', '2024-01-01T11:00:00.000Z'],
  ])('parses %s to an ISO string', (input, expected) => {
    expect(parseDateAndDateTime(input)).toBe(expected);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it.each<[Date, string]>([
    [new Date('2024-01-01'), '2024-01-01T00:00:00.000Z'],
    [new Date('2024-01-01T12:00:00.000Z'), '2024-01-01T12:00:00.000Z'],
  ])('parses Date %s to an ISO string', (input, expected) => {
    expect(parseDateAndDateTime(input)).toBe(expected);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('parses new Date() to an ISO string', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    expect(new Date().getHours()).toBe(1); // new Date() should be in local time, so 1 hour ahead of UTC for this date
    expect(parseDateAndDateTime(new Date())).toBe('2024-01-01T00:00:00.000Z');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('takes into account daylight saving summer time', () => {
    expect(parseDateAndDateTime('2024-04-01T12:00:00.000')).toBe(
      '2024-04-01T10:00:00.000Z'
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});

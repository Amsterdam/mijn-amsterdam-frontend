import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { toISOString } from './date';

describe('parseDateToIso', () => {
  const consoleErrorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('returns null for null/undefined/empty input', () => {
    expect(toISOString('')).toBeNull();
    expect(toISOString(null as unknown as string)).toBeNull();
    expect(toISOString(undefined as unknown as string)).toBeNull();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('returns an empty string and logs an error for invalid input', () => {
    expect(toISOString('not-a-date')).toBe(null);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it.each<[string, string]>([
    ['2024-01-01', '2023-12-31T23:00:00.000Z'],
    ['2024-01-01T12:00:00.000Z', '2024-01-01T12:00:00.000Z'],
    ['2024-01-01T12:00:00', '2024-01-01T11:00:00.000Z'],
  ])('parses %s to an ISO string', (input, expected) => {
    expect(toISOString(input)).toBe(expected);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it.each<[Date, string]>([
    [new Date('2024-01-01'), '2024-01-01T00:00:00.000Z'],
    [new Date('2024-01-01T12:00:00.000Z'), '2024-01-01T12:00:00.000Z'],
  ])('parses Date %s to an ISO string', (input, expected) => {
    expect(toISOString(input)).toBe(expected);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('parses new Date() to an ISO string', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    expect(new Date().getHours()).toBe(1); // new Date() should be in local time, so 1 hour ahead of UTC for this date
    expect(toISOString(new Date())).toBe('2024-01-01T00:00:00.000Z');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('takes into account daylight saving summer time', () => {
    expect(toISOString('2024-04-01T12:00:00.000')).toBe(
      '2024-04-01T10:00:00.000Z'
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});

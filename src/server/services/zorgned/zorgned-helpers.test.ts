import { parseISO } from 'date-fns';
import { isBeforeToday } from '../wmo-v2/status-line-items/wmo-generic';

describe('zorgned helpers', () => {
  test('isBeforeToday', () => {
    expect(
      isBeforeToday('2024-07-31T09:05:00', parseISO('2024-07-31T23:05:00'))
    ).toBe(false);

    expect(
      isBeforeToday('2024-07-31T09:05:00', parseISO('2024-07-31T09:05:00'))
    ).toBe(false);

    expect(
      isBeforeToday('2024-07-31T09:05:00', parseISO('2024-07-31T08:05:00'))
    ).toBe(false);

    expect(
      isBeforeToday('2024-07-31T09:05:00', parseISO('2024-08-31T08:05:00'))
    ).toBe(true);

    expect(isBeforeToday(null, parseISO('2024-08-31T08:05:00'))).toBe(false);
  });
});

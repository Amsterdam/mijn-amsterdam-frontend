import { parseISO } from 'date-fns';
import { isHistoricDate, isFutureDate } from './zorgned-helpers';

describe('zorgned helpers', () => {
  test('isHistoricDate', () => {
    expect(
      isHistoricDate('2024-07-31T09:05:00', parseISO('2024-07-31T23:05:00'))
    ).toBe(false);

    expect(
      isHistoricDate('2024-07-31T09:05:00', parseISO('2024-07-31T09:05:00'))
    ).toBe(false);

    expect(
      isHistoricDate('2024-07-31T09:05:00', parseISO('2024-07-31T08:05:00'))
    ).toBe(false);

    expect(
      isHistoricDate('2024-07-31T09:05:00', parseISO('2024-08-31T08:05:00'))
    ).toBe(true);
  });

  test('isFutureDate', () => {
    expect(
      isFutureDate('2024-08-31T09:05:00', parseISO('2024-07-31T23:05:00'))
    ).toBe(true);

    expect(
      isFutureDate('2024-07-31T09:05:00', parseISO('2024-07-31T09:06:00'))
    ).toBe(false);

    expect(
      isFutureDate('2024-07-31T09:05:00', parseISO('2024-08-31T08:05:00'))
    ).toBe(false);
  });
});

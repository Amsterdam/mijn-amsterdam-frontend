import MockDate from 'mockdate';

import {
  isExpiryNotificationDue,
  getCustomTitleForVergunningWithLicensePlates,
  getLifetimeTriggerDate,
} from './vergunningen-helpers.ts';
import { TouringcarDagontheffing } from '../parkeren/config-and-types.ts';

describe('vergunningen/helpers', () => {
  beforeAll(() => {
    MockDate.set('2023-01-01');
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('isExpiryNotificationDue', () => {
    test('Near', () => {
      expect(
        isExpiryNotificationDue(
          '2023-01-01',
          '2023-03-01',
          new Date('2023-02-24')
        )
      ).toBe(true);
    });

    test('Near with custom percentage', () => {
      expect(
        isExpiryNotificationDue(
          '2023-01-01',
          '2023-04-30',
          new Date('2023-02-01'),
          0.25
        )
      ).toBe(true);
    });

    test('Not near with custom percentage', () => {
      expect(
        isExpiryNotificationDue(
          '2023-01-01',
          '2023-04-30',
          new Date('2023-01-28'),
          0.25
        )
      ).toBe(false);
    });

    test('Not near', () => {
      expect(
        isExpiryNotificationDue(
          '2023-01-01',
          '2023-03-01',
          new Date('2023-01-24')
        )
      ).toBe(false);
    });

    test('In past', () => {
      expect(
        isExpiryNotificationDue(
          '2023-01-01',
          '2023-03-01',
          new Date('2022-12-29')
        )
      ).toBe(false);
    });
  });

  describe('getCustomTitleForVergunningWithLicensePlates', () => {
    test('Single kenteken title', () => {
      expect(
        getCustomTitleForVergunningWithLicensePlates({
          title: 'blaap',
          kentekens: 'AA-BB-CC',
        } as TouringcarDagontheffing)
      ).toBe('blaap (AA-BB-CC)');
    });

    test('Multiple kenteken title', () => {
      expect(
        getCustomTitleForVergunningWithLicensePlates({
          title: 'blaap',
          kentekens: 'AA-BB-CC | DDD-EE-F | ZZ-XX-00 | THJ-789-I',
        } as TouringcarDagontheffing)
      ).toMatchInlineSnapshot(`"blaap (AA-BB-CC... +3)"`);
    });
  });

  describe('getLifetimeTriggerDate', () => {
    test('Calculates trigger date with default percentage', () => {
      expect(
        getLifetimeTriggerDate('2023-01-01', '2023-12-31').toISOString()
      ).toEqual('2023-10-18T23:00:00.000Z');
    });

    test('Calculates trigger date with custom percentage', () => {
      expect(
        getLifetimeTriggerDate('2023-01-01', '2023-12-31', 0.5).toISOString()
      ).toEqual('2023-07-01T23:00:00.000Z');
    });

    test('Handles short date range', () => {
      expect(getLifetimeTriggerDate('2023-01-01', '2023-01-10')).toEqual(
        new Date('2023-01-08')
      );
    });

    test('Handles edge case with zero percentage', () => {
      expect(getLifetimeTriggerDate('2023-01-01', '2023-12-31', 0)).toEqual(
        new Date('2023-01-01')
      );
    });

    test('Handles edge case with 100% percentage', () => {
      expect(getLifetimeTriggerDate('2023-01-01', '2023-12-31', 1)).toEqual(
        new Date('2023-12-31')
      );
    });
  });
});

import MockDate from 'mockdate';

import {
  isNearEndDate,
  getCustomTitleForVergunningWithLicensePlates,
} from './vergunningen-helpers';
import { TouringcarDagontheffing } from '../parkeren/config-and-types';

describe('vergunningen/helpers', () => {
  beforeAll(() => {
    MockDate.set('2023-01-01');
  });

  afterAll(() => {
    MockDate.reset();
  });

  describe('isNearEndDate', () => {
    test('Near', () => {
      expect(
        isNearEndDate('2023-01-01', '2023-03-01', new Date('2023-02-24'))
      ).toBe(true);
    });

    test('Near with custom percentage', () => {
      expect(
        isNearEndDate('2023-01-01', '2023-04-30', new Date('2023-02-01'), 0.25)
      ).toBe(true);
    });

    test('Not near with custom percentage', () => {
      expect(
        isNearEndDate('2023-01-01', '2023-04-30', new Date('2023-01-28'), 0.25)
      ).toBe(false);
    });

    test('Not near', () => {
      expect(
        isNearEndDate('2023-01-01', '2023-03-01', new Date('2023-01-24'))
      ).toBe(false);
    });

    test('In past', () => {
      expect(
        isNearEndDate('2023-01-01', '2023-03-01', new Date('2022-12-29'))
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
});

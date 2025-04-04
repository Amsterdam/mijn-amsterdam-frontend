import {
  isNearEndDate,
  getCustomTitleForVergunningWithLicensePlates,
} from './vergunningen-helpers';
import { TouringcarDagontheffing } from '../parkeren/config-and-types';

describe('vergunningen/helpers', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2022-10-06'));

  describe('isNearEndDate', () => {
    test('Near', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 30);
      expect(isNearEndDate(d.toISOString())).toBe(true);
    });

    test('Not near', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 120);
      expect(isNearEndDate(d.toISOString())).toBe(false);
    });

    test('In past', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() - 120);
      expect(isNearEndDate(d.toISOString())).toBe(false);
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

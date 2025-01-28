import {
  TouringcarDagontheffing,
  VergunningFrontend,
} from './config-and-types';
import {
  isNearEndDate,
  isExpired,
  hasOtherActualVergunningOfSameType,
  getCustomTitleForVergunningWithLicensePlates,
} from './helpers';

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

  describe('isExpired', () => {
    test('Is expired', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 1);
      expect(
        isExpired(
          { dateEnd: new Date().toISOString() } as VergunningFrontend,
          d
        )
      ).toBe(true);
    });

    test('Is not expired', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() - 1);
      expect(
        isExpired(
          { dateEnd: new Date().toISOString() } as VergunningFrontend,
          d
        )
      ).toBe(false);
    });

    test('Is expired same date', () => {
      expect(
        isExpired(
          { dateEnd: new Date().toISOString() } as VergunningFrontend,
          new Date()
        )
      ).toBe(true);
    });
  });

  describe('hasOtherActualVergunningOfSameType', () => {
    const decosZaak = {
      caseType: 'test1',
      dateEnd: null,
      identifier: 'xx1',
    } as unknown as VergunningFrontend;

    test('Has other actual vergunning of same type', () => {
      const decosZaken = [
        { caseType: 'test1', dateEnd: null, identifier: 'xx2' },
        decosZaak,
      ] as unknown as VergunningFrontend[];

      expect(hasOtherActualVergunningOfSameType(decosZaken, decosZaak)).toBe(
        true
      );
    });

    test('Does not have other actual vergunning of same type', () => {
      const decosZaken = [decosZaak];

      expect(hasOtherActualVergunningOfSameType(decosZaken, decosZaak)).toBe(
        false
      );
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

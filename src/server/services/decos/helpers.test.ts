import {
  DecosZaakBase,
  DecosZaakSource,
  DecosZaakTransformer,
} from './decos-types';
import {
  getCustomTitleForDecosZaakWithLicensePlates,
  getDecosZaakTypeFromSource,
  hasInvalidDecision,
  hasOtherActualDecosZaakOfSameType,
  isExcludedFromTransformation,
  isExpired,
  isNearEndDate,
  isScheduledForRemoval,
  isWaitingForPaymentConfirmation,
  toDateFormatted,
  transformBoolean,
  transformKenteken,
} from './helpers';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { TouringcarDagontheffing } from '../vergunningen-v2/config-and-types';
import { decosCaseToZaakTransformers } from '../vergunningen-v2/decos-zaken';

describe('helpers/decos', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2022-10-06'));

  test('isNearEndDate', () => {
    {
      // No end date
      const decosZaak = {
        dateEnd: null,
      };
      expect(isNearEndDate(decosZaak)).toBe(false);
    }
    {
      // Near end
      const decosZaak = {
        dateEnd: '2022-10-28',
      };
      expect(isNearEndDate(decosZaak)).toBe(true);
    }
    {
      // Not near end
      const decosZaak = {
        dateEnd: '2023-10-28',
      };
      expect(isNearEndDate(decosZaak)).toBe(false);
    }
  });

  test('isExpired', () => {
    {
      // Not expired
      const decosZaak = {
        dateEnd: '2023-10-28',
      };
      expect(isExpired(decosZaak)).toBe(false);
    }
    {
      const decosZaak = {
        dateEnd: '2022-10-07',
      };
      expect(isExpired(decosZaak)).toBe(false);
    }
    {
      // Is expired
      const decosZaak = {
        dateEnd: '2022-10-06',
      };
      expect(isExpired(decosZaak)).toBe(true);
    }
    {
      const decosZaak = {
        dateEnd: '2022-10-06',
      };
      expect(isExpired(decosZaak)).toBe(true);
    }
    {
      const decosZaak = {
        dateEnd: '2022-09-28',
      };
      expect(isExpired(decosZaak)).toBe(true);
    }
  });

  test('hasOtherActualDecosZaakOfSameType', () => {
    const decosZaak = {
      caseType: 'test1',
      dateEnd: null,
      identifier: 'xx1',
    } as unknown as DecosZaakBase;

    {
      const decosZaken = [
        { caseType: 'test1', dateEnd: null, identifier: 'xx2' },
        decosZaak,
      ] as unknown as DecosZaakBase[];

      expect(hasOtherActualDecosZaakOfSameType(decosZaken, decosZaak)).toBe(
        true
      );
    }

    {
      const decosZaken = [decosZaak];

      expect(hasOtherActualDecosZaakOfSameType(decosZaken, decosZaak)).toBe(
        false
      );
    }

    {
      const decosZaken = [
        { caseType: 'test1', dateEnd: '2022-05-06', identifier: 'xx2' },
        decosZaak,
      ] as unknown as DecosZaakBase[];

      expect(hasOtherActualDecosZaakOfSameType(decosZaken, decosZaak)).toBe(
        false
      );
    }
  });

  describe('isWaitingForPaymentConfirmation', () => {
    test('Is waiting', () => {
      const zaak = {
        fields: {
          text45: CaseTypeV2.WVOS,
          text11: 'nogniet',
          text12: 'wacht op online betaling',
        },
      } as DecosZaakSource;

      expect(
        isWaitingForPaymentConfirmation(
          zaak,
          decosCaseToZaakTransformers['Werk en vervoer op straat']
        )
      ).toBe(true);
    });

    test('Is not waiting: wrong caseType', () => {
      const zaak = {
        fields: {
          text45: 'Blaap',
          text11: 'nogniet',
          text12: 'wacht op online betaling',
        },
      } as DecosZaakSource;

      expect(
        isWaitingForPaymentConfirmation(
          zaak,
          {} as unknown as DecosZaakTransformer<DecosZaakBase>
        )
      ).toBe(false);
    });

    test('Is not waiting', () => {
      const zaak = {
        fields: {
          text45: CaseTypeV2.WVOS,
          text11: 'jahoor',
          text12: 'wacht op online betaling',
        },
      } as DecosZaakSource;

      expect(
        isWaitingForPaymentConfirmation(
          zaak,
          decosCaseToZaakTransformers['Werk en vervoer op straat']
        )
      ).toBe(false);
    });

    test('Is still waiting', () => {
      const zaak = {
        fields: {
          text45: CaseTypeV2.WVOS,
          subject1: 'wacht op ideal betaling',
        },
      } as DecosZaakSource;

      expect(
        isWaitingForPaymentConfirmation(
          zaak,
          decosCaseToZaakTransformers['Werk en vervoer op straat']
        )
      ).toBe(true);
    });
  });

  describe('hasInvalidDecision', () => {
    test('No decision', () => {
      const zaak = {
        fields: {
          dfunction: null,
        },
      } as DecosZaakSource;

      expect(hasInvalidDecision(zaak)).toBe(false);
    });

    test('No decision', () => {
      const zaak = {
        fields: {
          x: null,
        },
      } as unknown as DecosZaakSource;

      expect(hasInvalidDecision(zaak)).toBe(false);
    });

    test('Invalid decision', () => {
      const zaak = {
        fields: {
          dfunction: 'buiten behandeling',
        },
      } as DecosZaakSource;

      expect(hasInvalidDecision(zaak)).toBe(true);
    });

    test('Valid decision', () => {
      const zaak = {
        fields: {
          dfunction: 'Gewoon doen!',
        },
      } as DecosZaakSource;

      expect(hasInvalidDecision(zaak)).toBe(false);
    });
  });

  describe('isScheduledForRemoval', () => {
    test('Is scheduled', () => {
      expect(
        isScheduledForRemoval({
          fields: { subject1: '*verWijDER' },
        } as DecosZaakSource)
      ).toBe(true);
    });

    test('Is NOT scheduled', () => {
      expect(
        isScheduledForRemoval({
          fields: { subject1: 'nog niet verWijDERen' },
        } as DecosZaakSource)
      ).toBe(false);
    });
  });

  describe('isExcludedFromTransformation', () => {
    test('Is excluded by scheduled for removal', () => {
      expect(
        isExcludedFromTransformation(
          { fields: { subject1: '*verwijder' } } as DecosZaakSource,
          decosCaseToZaakTransformers[CaseTypeV2.AanbiedenDiensten]
        )
      ).toBe(true);
    });

    test('Is excluded by invalid decision', () => {
      expect(
        isExcludedFromTransformation(
          { fields: { dfunction: 'buiten behandeling' } } as DecosZaakSource,
          decosCaseToZaakTransformers[CaseTypeV2.AanbiedenDiensten]
        )
      ).toBe(true);
    });

    test('Is excluded by waiting for payment confirmation', () => {
      expect(
        isExcludedFromTransformation(
          {
            fields: {
              text45: CaseTypeV2.WVOS,
              text11: 'nogniet',
              text12: 'wacht op online betaling',
            },
          } as DecosZaakSource,
          decosCaseToZaakTransformers[CaseTypeV2.WVOS]
        )
      ).toBe(true);
    });

    test('Is excluded by Inactive transformer state', () => {
      expect(
        isExcludedFromTransformation(
          {
            fields: {
              text45: CaseTypeV2.WVOS,
            },
          } as DecosZaakSource,
          { ...decosCaseToZaakTransformers[CaseTypeV2.WVOS], isActive: false }
        )
      ).toBe(true);
    });

    test('Is NOT excluded by Inactive transformer state', () => {
      expect(
        isExcludedFromTransformation(
          {
            fields: {
              text45: CaseTypeV2.WVOS,
            },
          } as DecosZaakSource,
          { ...decosCaseToZaakTransformers[CaseTypeV2.WVOS] }
        )
      ).toBe(false);
    });
  });

  describe('transformKenteken', () => {
    test('transforms single kenteken', () => {
      expect(transformKenteken('SS-DD-AA')).toBe('SSDDAA');
    });
    test('transforms multiple kentekens', () => {
      expect(transformKenteken('SS-DD-AA, BBB-CCC WHAHAH')).toBe(
        'SSDDAA | BBBCCC | WHAHAH'
      );
    });
  });

  describe('getCustomTitleForVergunningWithLicensePlates', () => {
    test('Single kenteken title', () => {
      expect(
        getCustomTitleForDecosZaakWithLicensePlates({
          title: 'blaap',
          kentekens: 'AA-BB-CC',
        } as TouringcarDagontheffing)
      ).toBe('blaap (AA-BB-CC)');
    });

    test('Multiple kenteken title', () => {
      expect(
        getCustomTitleForDecosZaakWithLicensePlates({
          title: 'blaap',
          kentekens: 'AA-BB-CC | DDD-EE-F | ZZ-XX-00 | THJ-789-I',
        } as TouringcarDagontheffing)
      ).toMatchInlineSnapshot(`"blaap (AA-BB-CC... +3)"`);
    });
  });

  test('getDecosZaakTypeFromSource', () => {
    expect(
      getDecosZaakTypeFromSource({
        fields: { text45: 'Werk en vervoer op straat' },
      } as unknown as DecosZaakSource)
    ).toBe(CaseTypeV2.WVOS);
  });

  test('transformBoolean', () => {
    expect(transformBoolean(undefined)).toBe(false);
    expect(transformBoolean(null)).toBe(false);
    expect(transformBoolean('yes')).toBe(true);
    expect(transformBoolean('')).toBe(false);
    expect(transformBoolean(' ')).toBe(true);
  });

  describe('isNearEndDate', () => {
    test('Near', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 30);
      expect(isNearEndDate({ dateEnd: d.toISOString() })).toBe(true);
    });

    test('Not near', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 120);
      expect(isNearEndDate({ dateEnd: d.toISOString() })).toBe(false);
    });

    test('In past', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() - 120);
      expect(isNearEndDate({ dateEnd: d.toISOString() })).toBe(false);
    });
  });

  describe('isExpired', () => {
    test('Is expired', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 1);
      expect(isExpired({ dateEnd: new Date().toISOString() }, d)).toBe(true);
    });

    test('Is not expired', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() - 1);
      expect(isExpired({ dateEnd: new Date().toISOString() }, d)).toBe(false);
    });

    test('Is expired same date', () => {
      expect(isExpired({ dateEnd: new Date().toISOString() }, new Date())).toBe(
        true
      );
    });
  });

  describe('toDateFormatted', () => {
    test('has date', () => {
      expect(toDateFormatted('2024-05-04')).toBe('04 mei 2024');
    });
    test('has no date', () => {
      expect(toDateFormatted(null)).toBe(null);
    });
  });
});

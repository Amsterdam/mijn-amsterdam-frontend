import {
  isWaitingForPaymentConfirmation,
  hasInvalidDecision,
  isScheduledForRemoval,
  isExcludedFromTransformation,
  transformKenteken,
  getDecosZaakTypeFromSource,
  transformBoolean,
  isExpired,
} from './decos-helpers';
import {
  DecosZaakBase,
  DecosZaakSource,
  DecosZaakTransformer,
} from './decos-types';
import { decosCaseToZaakTransformers } from '../vergunningen/decos-zaken';

describe('decos/helpers', () => {
  describe('isWaitingForPaymentConfirmation', () => {
    test('Is waiting', () => {
      const zaak = {
        fields: {
          text45: 'Werk en vervoer op straat',
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
          text45: 'Werk en vervoer op straat',
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
          text45: 'Werk en vervoer op straat',
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
          decosCaseToZaakTransformers['Aanbieden van diensten']
        )
      ).toBe(true);
    });

    test('Is excluded by invalid decision', () => {
      expect(
        isExcludedFromTransformation(
          { fields: { dfunction: 'buiten behandeling' } } as DecosZaakSource,
          decosCaseToZaakTransformers['Aanbieden van diensten']
        )
      ).toBe(true);
    });

    test('Is excluded by waiting for payment confirmation', () => {
      expect(
        isExcludedFromTransformation(
          {
            fields: {
              text45: 'Werk en vervoer op straat',
              text11: 'nogniet',
              text12: 'wacht op online betaling',
            },
          } as DecosZaakSource,
          decosCaseToZaakTransformers['Werk en vervoer op straat']
        )
      ).toBe(true);
    });

    test('Is excluded by Inactive transformer state', () => {
      expect(
        isExcludedFromTransformation(
          {
            fields: {
              text45: 'Werk en vervoer op straat',
            },
          } as DecosZaakSource,
          {
            ...decosCaseToZaakTransformers['Werk en vervoer op straat'],
            isActive: false,
          }
        )
      ).toBe(true);
    });

    test('Is NOT excluded by Inactive transformer state', () => {
      expect(
        isExcludedFromTransformation(
          {
            fields: {
              text45: 'Werk en vervoer op straat',
            },
          } as DecosZaakSource,
          { ...decosCaseToZaakTransformers['Werk en vervoer op straat'] }
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

  test('getDecosZaakTypeFromSource', () => {
    expect(
      getDecosZaakTypeFromSource({
        fields: { text45: 'Werk en vervoer op straat' },
      } as unknown as DecosZaakSource)
    ).toBe('Werk en vervoer op straat');
  });

  test('transformBoolean', () => {
    expect(transformBoolean(undefined)).toBe(false);
    expect(transformBoolean(null)).toBe(false);
    expect(transformBoolean('yes')).toBe(true);
    expect(transformBoolean('')).toBe(false);
    expect(transformBoolean(' ')).toBe(true);
  });

  describe('isExpired', () => {
    test('Is expired', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() + 1);
      expect(isExpired(new Date().toISOString(), d)).toBe(true);
    });

    test('Is not expired', () => {
      const d = new Date();
      d.getDate();
      d.setDate(d.getDate() - 1);
      expect(isExpired(new Date().toISOString(), d)).toBe(false);
    });

    test('Is expired same date', () => {
      expect(isExpired(new Date().toISOString(), new Date())).toBe(true);
    });
  });
});

import Mockdate from 'mockdate';

import {
  hasBijstandsuitkering,
  hasBnBVergunning,
  hasBudget,
  hasDutchNationality,
  hasKidsBetweenAges2And18,
  hasOldestKidBornFrom2016,
  hasStadspasGroeneStip,
  hasToeristicheVerhuurVergunningen,
  hasTozo,
  hasValidId,
  hasValidIdForVoting,
  hasValidRecentStadspasRequest,
  is18OrOlder,
  isBetween17and18,
  isLivingInAmsterdamLessThanNumberOfDays,
  isMarriedOrLivingTogether,
  isReceivingSubsidy,
  not,
  or,
  previouslyLivingInAmsterdam,
} from './predicates';
import { TipsPredicateFN } from './tip-types';
import { brpApiResponse } from './tips-service.test';
import WPI_AANVRAGEN from '../../../../mocks/fixtures/wpi-aanvragen.json';
import WPI_E from '../../../../mocks/fixtures/wpi-e-aanvragen.json';
import { ApiResponse_DEPRECATED } from '../../../universal/helpers/api';
import { AppState } from '../../../universal/types/App.types';
import { BRPData } from '../profile/brp.types';
import { WpiRequestProcess } from '../wpi/wpi-types';

const TONK = {
  content: WPI_E.content.filter((c) => c.about === 'TONK'),
  status: 'OK',
};

const TOZO = {
  content: WPI_E.content.filter((c) => c.about === 'Tozo 5'),
  status: 'OK',
};

const UITKERINGEN = {
  content: WPI_AANVRAGEN.content.filter(
    (c) => c.about === 'Bijstandsuitkering'
  ),
  status: 'OK',
};

const TOERISTISCHE_VERHUUR = {
  content: {
    lvvRegistraties: [1, 2, 3],
    vakantieverhuurVergunningen: [1, 2, 3],
    bbVergunningen: [1, 2, 3],
  },
};

const DATE_TO_TEST_AGAINST = '2022-07-25';

describe('predicates', () => {
  beforeAll(() => {
    Mockdate.set(DATE_TO_TEST_AGAINST);
  });

  afterAll(() => {
    Mockdate.reset();
  });

  describe('BRP', () => {
    describe('is18OrOlder', () => {
      const getMockAppState = (geboortedatum: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            persoon: { geboortedatum },
          }),
        } as AppState;
      };

      it.each([
        [true, '1901-09-05'],
        [true, '1971-09-05'],
        [true, '2004-07-24'],
        [false, '2004-07-26'],
        [false, '2005-05-01'],
        [false, '2022-08-27'],
      ])('should return %s for birthday %s', (expected, birthday) => {
        const appState = getMockAppState(birthday);
        expect(is18OrOlder(appState)).toBe(expected);
      });
    });

    describe('hasValidId', () => {
      const getMockAppState = (datumAfloop: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            identiteitsbewijzen: [{ datumAfloop }],
          }),
        } as AppState;
      };

      it.each([
        [false, '2002-07-26'],
        [false, '2022-07-24'],
        [true, '2022-07-25'],
        [true, '2022-07-26'],
        [true, '2028-07-24'],
      ])('should return %s for datumAfloop %s', (expected, datumAfloop) => {
        const appState = getMockAppState(datumAfloop);

        expect(hasValidId(appState)).toBe(expected);
      });
    });

    describe('hasValidIdForVoting', () => {
      const getMockAppState = (datumAfloop: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            identiteitsbewijzen: [{ datumAfloop }],
          }),
        } as AppState;
      };

      it.each([
        [false, '2002-07-26'],
        [false, '2017-07-24'],
        [true, '2018-11-20'],
        [true, '2022-07-24'],
        [true, '2022-07-25'],
        [true, '2028-07-24'],
      ])('should return %s for datumAfloop %s', (expected, datumAfloop) => {
        const appState = getMockAppState(datumAfloop);

        expect(hasValidIdForVoting(appState)).toBe(expected);
      });
    });

    describe('previouslyLivingInAmsterdam', () => {
      const getMockAppState = (woonplaatsNaam: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            adresHistorisch: [{ woonplaatsNaam }],
          }),
        } as AppState;
      };

      it.each([
        [true, 'Amsterdam'],
        [false, 'Rotterdam'],
      ])(
        'should return %s for woonplaatsNaam %s',
        (expected, woonplaatsNaam) => {
          expect(
            previouslyLivingInAmsterdam(getMockAppState(woonplaatsNaam))
          ).toBe(expected);
        }
      );
    });

    describe('isLivingInAmsterdamLessThanNumberOfDays', () => {
      const getMockAppState = (begindatumVerblijf: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            adres: { begindatumVerblijf },
          }),
        } as AppState;
      };

      it.each([
        [true, 1, '2022-07-24'],
        [false, 100, '2020-07-25'],
        [false, 3, '2022-07-21'],
        [true, 10, '2022-07-16'],
      ])(
        'should return %s for %d days since beginDatumVerblijf is %s',
        (expected, numberOfDays, date) => {
          expect(
            isLivingInAmsterdamLessThanNumberOfDays(numberOfDays)(
              getMockAppState(date)
            )
          ).toBe(expected);
        }
      );
    });

    describe('hasKidsBetweenAges2And18', () => {
      const getMockAppState = (
        geboortedatumKind1: string,
        geboortedatumKind2: string
      ) => {
        return {
          BRP: brpApiResponse<BRPData>({
            kinderen: [
              { geboortedatum: geboortedatumKind1 },
              { geboortedatum: geboortedatumKind2 },
            ],
          }),
        } as AppState;
      };

      it.each([
        [true, '2019-01-04', '2015-05-05'],
        [true, '2020-07-24', '2021-12-25'],
        [false, '1990-03-20', '2000-10-29'],
        [false, '2020-07-26', '2003-07-24'],
      ])(
        'should return %s for kids with birthdays at %s and %s',
        (expected, birthdate1, birthdate2) => {
          expect(
            hasKidsBetweenAges2And18(getMockAppState(birthdate1, birthdate2))
          ).toBe(expected);
        }
      );
    });

    describe('hasOldestKidBornFrom2016', () => {
      const getMockAppState = (
        geboortedatumKind1: string,
        geboortedatumKind2: string
      ) => {
        return {
          BRP: brpApiResponse<BRPData>({
            kinderen: [
              { geboortedatum: geboortedatumKind1 },
              { geboortedatum: geboortedatumKind2 },
            ],
          }),
        } as AppState;
      };

      it.each([
        [false, '2019-01-04', '2015-05-05'],
        [true, '2016-01-01', '2021-12-25'],
        [false, '1990-03-20', '2000-10-29'],
        [false, '2024-07-26', '2024-07-24'],
      ])(
        'should return %s for kids with birthdays at %s and %s',
        (expected, birthdate1, birthdate2) => {
          expect(
            hasOldestKidBornFrom2016(getMockAppState(birthdate1, birthdate2))
          ).toBe(expected);
        }
      );
    });

    describe('isMarriedOrLivingTogether', () => {
      const getMockAppState = (verbintenis: {
        datumSluiting: string;
        datumOntbindingFormatted?: string;
      }) => {
        return {
          BRP: brpApiResponse<BRPData>({
            verbintenis,
          }),
        } as AppState;
      };

      it.each([
        [true, { datumSluiting: '2020-07-24' }],
        [
          false,
          {
            datumSluiting: '2020-07-24',
            datumOntbindingFormatted: '2 juli 2021',
          },
        ],
      ])(
        'should return %s for burgerlijkeStaat %s',
        (expected, verbintenis) => {
          expect(isMarriedOrLivingTogether(getMockAppState(verbintenis))).toBe(
            expected
          );
        }
      );
    });

    describe('hasDutchNationality', () => {
      const getMockAppState = (omschrijving: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            persoon: { nationaliteiten: [{ omschrijving }] },
          }),
        } as AppState;
      };

      it.each([
        [true, 'Nederlandse'],
        [false, 'Duitse'],
      ])('should return %s for nationality %s', (expected, nationality) => {
        expect(hasDutchNationality(getMockAppState(nationality))).toBe(
          expected
        );
      });
    });

    describe('isBetween17and18', () => {
      const getMockAppState = (geboortedatum: string) => {
        return {
          BRP: brpApiResponse<BRPData>({
            persoon: { geboortedatum },
          }),
        } as AppState;
      };

      it.each([
        [true, '2005-07-24'],
        [true, '2003-07-26'],
        [false, '2003-07-24'],
        [false, '2005-07-26'],
        [false, '2000-03-29'],
      ])('should return %s for birthday %s', (expected, birthdate) => {
        expect(isBetween17and18(getMockAppState(birthdate))).toBe(expected);
      });
    });
  });

  describe('HLI/STADSPAS', () => {
    test('hasStadspasGroeneStip', () => {
      const appState = {
        HLI: {
          status: 'OK',
          content: { stadspas: [{ passType: 'kind' }] },
        },
      } as unknown as AppState;

      expect(hasStadspasGroeneStip(appState)).toEqual(true);
    });

    describe('hasValidRecentStadspasRequest', () => {
      const getMockAppState = (decision: string, dateDecision: string) => {
        const aanvraag = {
          decision,
          dateDecision,
        };

        return {
          HLI: {
            content: {
              stadspas: {
                stadspassen: [],
              },
              regelingen: [aanvraag],
            },
            status: 'OK',
          },
        };
      };

      it.each([
        [true, 'toegewezen', '2021-12-31'],
        [true, 'toegewezen', '2022-01-24'],
        [true, 'toegewezen', '2020-07-26'],
        [false, 'toegewezen', '2020-07-24'],
        [false, 'toegewezen', '2000-07-24'],
        [false, 'afgewezen', '2022-01-24'],
        [false, 'afgewezen', '2002-01-24'],
      ])(
        'should return %s for decision %s with dateDecision %s',
        (expected, decision, date) => {
          expect(
            hasValidRecentStadspasRequest(
              getMockAppState(decision, date) as unknown as AppState
            )
          ).toBe(expected);
        }
      );
    });
  });

  describe('WPI_TOZO & WPI_AANVRAGEN', () => {
    describe('isReceivingSubsidy', () => {
      const getMockAppState = (
        tozoDateAndDecision: string[],
        tonkDateAndDecision: string[],
        wpiDateAndDecision: string[]
      ) => {
        TOZO.content[0].decision = tozoDateAndDecision[0];
        TOZO.content[0].datePublished = tozoDateAndDecision[1];

        TONK.content[0].decision = tonkDateAndDecision[0];
        TONK.content[0].datePublished = tonkDateAndDecision[1];

        UITKERINGEN.content[0].decision = wpiDateAndDecision[0];
        UITKERINGEN.content[0].datePublished = wpiDateAndDecision[1];

        return {
          WPI_TOZO: TOZO as unknown as AppState['WPI_TOZO'],
          WPI_TONK: TONK as unknown as ApiResponse_DEPRECATED<
            WpiRequestProcess[] | null
          >,
          WPI_AANVRAGEN: UITKERINGEN as unknown as ApiResponse_DEPRECATED<
            WpiRequestProcess[] | null
          >,
        };
      };

      it.each([
        [
          false,
          ['toekenning', '2020-07-24'],
          ['toekenning', '2020-07-24'],
          ['toekenning', '2020-07-24'],
        ],
        [
          false,
          ['afwijzing', '2022-07-24'],
          ['afwijzing', '2022-07-24'],
          ['afwijzing', '2022-07-24'],
        ],
        [
          true,
          ['toekenning', '2022-05-26'],
          ['toekenning', '2022-05-26'],
          ['toekenning', '2022-05-26'],
        ],
        [
          true,
          ['toekenning', '2022-05-26'],
          ['afwijzing', '2020-10-01'],
          ['geen toekenning', '2022-07-25'],
        ],
        [
          true,
          ['afwijzing', '2020-10-01'],
          ['toekenning', '2022-05-26'],
          ['geen toekenning', '2022-07-25'],
        ],
        [
          true,
          ['afwijzing', '2020-10-01'],
          ['geen toekenning', '2022-07-25'],
          ['toekenning', '2022-05-26'],
        ],
        [
          true,
          ['toekenning', '2022-05-26'],
          ['geen toekenning', '2022-07-25'],
          ['toekenning', '2022-05-26'],
        ],
        [
          true,
          ['geen toekenning', '2022-07-25'],
          ['toekenning', '2022-05-26'],
          ['toekenning', '2022-05-26'],
        ],
      ])(
        'should return %s for TOZO %s and TONK %s and WPI %s',
        (
          expected,
          tozoDateAndDecision,
          tonkDateAndDecision,
          wpiDateAndDecision
        ) => {
          expect(
            isReceivingSubsidy(
              getMockAppState(
                tozoDateAndDecision,
                tonkDateAndDecision,
                wpiDateAndDecision
              )
            )
          ).toBe(expected);
        }
      );
    });

    describe('hasBijstandsuitkering', () => {
      const getMockAppState = (decision: string, datePublished: string) => {
        UITKERINGEN.content[0].decision = decision;
        UITKERINGEN.content[0].datePublished = datePublished;

        return {
          WPI_AANVRAGEN: UITKERINGEN as unknown as ApiResponse_DEPRECATED<
            WpiRequestProcess[] | null
          >,
        };
      };

      it.each([
        [true, 'toekenning', '2022-07-26'],
        [true, 'toekenning', '2021-07-26'],
        [false, 'toekenning', '2020-07-24'],
        [false, 'niet toekenning', '2022-07-26'],
      ])(
        'should return %s for decision %s and date %s',
        (expected, decision, datePublished) => {
          expect(
            hasBijstandsuitkering(getMockAppState(decision, datePublished))
          ).toBe(expected);
        }
      );
    });

    describe('hasTozo', () => {
      it('should return true when there is some content', () => {
        const appState = {
          WPI_TOZO: TOZO as unknown as ApiResponse_DEPRECATED<
            WpiRequestProcess[] | null
          >,
        };

        expect(hasTozo(appState)).toBe(true);
      });

      it('should return false when no content', () => {
        const appState = {
          WPI_TOZO: {} as ApiResponse_DEPRECATED<WpiRequestProcess[] | null>,
        };
        expect(hasTozo(appState)).toBe(false);
      });
    });
  });

  describe('hasBudget', () => {
    const state = {
      HLI: {
        status: 'OK',
        content: {
          stadspas: {
            stadspassen: [
              {
                budgets: [{ title: 'Witgoed regeling' }],
              },
            ],
          },
        },
      },
    };
    test('hasBudget with correct name', () => {
      expect(hasBudget('witgoed')(state as unknown as AppState)).toBe(true);
    });

    test('hasBudget name not found', () => {
      expect(hasBudget('zwartgoed')(state as unknown as AppState)).toBe(false);
    });
  });

  describe('TOERISTISCHE_VERHUUR', () => {
    test('hasToeristicheVerhuurVergunningen', () => {
      expect(
        hasToeristicheVerhuurVergunningen({
          TOERISTISCHE_VERHUUR,
        } as unknown as AppState)
      ).toBe(true);
    });
    test('hasBnBVergunning', () => {
      expect(
        hasBnBVergunning({ TOERISTISCHE_VERHUUR } as unknown as AppState)
      ).toBe(true);
    });
  });

  describe('generic', () => {
    const truthyPredicate: TipsPredicateFN = () => true;
    const falsyPredicate: TipsPredicateFN = () => false;

    describe('or', () => {
      it('should return the expected output', () => {
        expect(or([truthyPredicate, truthyPredicate])({})).toBe(true);
        expect(or([truthyPredicate, falsyPredicate])({})).toBe(true);
        expect(or([falsyPredicate, falsyPredicate])({})).toBe(false);
      });
    });

    describe('not', () => {
      it('should return the expected output', () => {
        expect(not(truthyPredicate)({})).toBe(false);
        expect(not(falsyPredicate)({})).toBe(true);
      });
    });
  });
});

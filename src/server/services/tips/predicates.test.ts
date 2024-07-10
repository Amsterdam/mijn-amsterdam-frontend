import BRP from '../../../../mocks/fixtures/brp.json';
import WPI_AANVRAGEN from '../../../../mocks/fixtures/wpi-aanvragen.json';
import WPI_E from '../../../../mocks/fixtures/wpi-e-aanvragen.json';
import { BRPData, BRPDataFromSource } from '../../../universal/types';
import { transformBRPData } from '../brp';
import { WpiRequestProcess } from '../wpi/wpi-types';

import type { AppState } from '../../../client/AppState';
import {
  ApiResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import {
  hasBijstandsuitkering,
  hasBnBVergunning,
  hasDutchNationality,
  hasKidsBetweenAges2And18,
  hasOldestKidBornFrom2016,
  hasStadspasGroeneStip,
  hasToeristicheVerhuurVergunningen,
  hasTozo,
  hasValidId,
  hasValidIdForVoting,
  hasValidStadspasRequest,
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

const vakantieverhuurVergunningen = [
  {
    id: 'Z-001-000040',
    titel: 'Vergunning vakantieverhuur',
    datumAfhandeling: null,
    datumAanvraag: '10 mei 2021',
    datumVan: '01 juni 2020',
    datumTot: '31 mei 2024',
    adres: 'Amstel 1 1017AB Amsterdam',
    resultaat: 'Ingetrokken',
    zaaknummer: 'Z/001/000040',
    statussen: [
      {
        status: 'Ontvangen',
        datePublished: '2021-05-10',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'In behandeling',
        datePublished: '2021-05-10',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Afgehandeld',
        datePublished: '2021-05-10',
        description: '',
        isActive: false,
        isChecked: true,
      },
      {
        status: 'Gewijzigd',
        datePublished: '',
        description: 'Wij hebben uw Vergunning vakantieverhuur ingetrokken.',
        isActive: true,
        isChecked: true,
      },
    ],
    documentenUrl:
      '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
    link: {
      to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-001-000040',
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
    isActief: false,
    status: 'Ingetrokken',
  },
];

const TOERISTISCHE_VERHUUR = {
  content: {
    lvvRegistraties: [1, 2, 3],
    vakantieverhuurVergunningen: [1, 2, 3],
    bbVergunningen: [1, 2, 3],
  },
};

describe('predicates', () => {
  const DATE_TO_TEST_AGAINST = '2022-07-25';

  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date(DATE_TO_TEST_AGAINST));
  });

  describe('BRP', () => {
    const getBRPAppState = (BRP: Record<string, any>) => {
      return {
        BRP: {
          content: transformBRPData(
            BRP as ApiSuccessResponse<BRPDataFromSource>
          ),
          status: 'OK',
        } as ApiResponse<BRPData>,
      };
    };

    describe('is18OrOlder', () => {
      const getMockAppState = (geboortedatum: string) => {
        const BRPCopy = { ...BRP };

        BRPCopy.content.persoon.geboortedatum = geboortedatum;

        return getBRPAppState(BRPCopy);
      };

      it.each([
        [true, '1901-09-05'],
        [true, '1971-09-05'],
        [true, '2004-07-24'],
        [false, '2004-07-26'],
        [false, '2005-05-01'],
        [false, '2022-08-27'],
      ])('should return %s for birthday %s', (expexted, birthday) => {
        const appState = getMockAppState(birthday);
        expect(is18OrOlder(appState)).toBe(expexted);
      });
    });

    describe('hasValidId', () => {
      const getMockAppState = (datumAfloop: string) => {
        const BRPCopy = { ...BRP };

        BRPCopy.content.identiteitsbewijzen.forEach((i) => {
          i.datumAfloop = datumAfloop;
        });

        return getBRPAppState(BRPCopy);
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
        const BRPCopy = { ...BRP };

        BRPCopy.content.identiteitsbewijzen.forEach((i) => {
          i.datumAfloop = datumAfloop;
        });

        return getBRPAppState(BRPCopy);
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
        const BRPCopy = { ...BRP };

        BRPCopy.content.adresHistorisch[0].woonplaatsNaam = woonplaatsNaam;

        return getBRPAppState(BRPCopy);
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
        const BRPCopy = { ...BRP };

        BRP.content.adres.begindatumVerblijf = begindatumVerblijf;

        return getBRPAppState(BRPCopy);
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
        const BRPCopy = { ...BRP };

        BRP.content.kinderen[0].geboortedatum = geboortedatumKind1;
        BRP.content.kinderen[1].geboortedatum = geboortedatumKind2;

        return getBRPAppState(BRPCopy);
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
        const BRPCopy = { ...BRP };

        BRP.content.kinderen[0].geboortedatum = geboortedatumKind1;
        BRP.content.kinderen[1].geboortedatum = geboortedatumKind2;

        return getBRPAppState(BRPCopy);
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
      const getMockAppState = (burgerlijkeStaat: string) => {
        const BRPCopy = { ...BRP };

        BRPCopy.content.verbintenis.soortVerbintenis = burgerlijkeStaat;

        return getBRPAppState(BRPCopy);
      };

      it.each([
        [true, 'h'],
        [false, ''],
      ])(
        'should return %s for burgerlijkeStaat %s',
        (expected, burgerlijkeStaat) => {
          expect(
            isMarriedOrLivingTogether(getMockAppState(burgerlijkeStaat))
          ).toBe(expected);
        }
      );
    });

    describe('hasDutchNationality', () => {
      const getMockAppState = (nationaliteit: string) => {
        const BRPCopy = { ...BRP };

        BRP.content.persoon.nationaliteiten[0] = {
          omschrijving: nationaliteit,
        };

        return getBRPAppState(BRPCopy);
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
      const getMockAppState = (birthdate: string) => {
        const BRPCopy = { ...BRP };

        BRPCopy.content.persoon.geboortedatum = birthdate;

        return getBRPAppState(BRPCopy);
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

  describe('STADSPAS', () => {
    test('hasStadspasGroeneStip', () => {
      const appState = {
        STADSPAS: {
          status: 'OK',
          content: { stadspassen: [{ passType: 'kind' }] },
        },
      } as AppState;
      expect(hasStadspasGroeneStip(appState)).toEqual(true);
    });

    describe('hasValidStadspasRequest', () => {
      const getMockAppState = (decision: string, datePublished: string) => {
        const aanvraag = WPI_AANVRAGEN.content[3];
        aanvraag.decision = decision;
        aanvraag.datePublished = datePublished;

        return {
          STADSPAS: {
            content: {
              stadspassen: [],
              aanvragen: [aanvraag],
            },
            status: 'OK',
          },
        };
      };

      it.each([
        [true, 'toekenning', '2021-12-31'],
        [true, 'toekenning', '2022-01-24'],
        [true, 'toekenning', '2020-07-26'],
        [false, 'toekenning', '2020-07-24'],
        [false, 'toekenning', '2000-07-24'],
        [false, 'afwijzing', '2022-01-24'],
        [false, 'afwijzing', '2002-01-24'],
      ])(
        'should return %s for decision %s with datePublished %s',
        (expected, decision, date) => {
          expect(
            hasValidStadspasRequest(
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
          WPI_TONK: TONK as unknown as ApiResponse<WpiRequestProcess[] | null>,
          WPI_AANVRAGEN: UITKERINGEN as ApiResponse<WpiRequestProcess[] | null>,
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
          WPI_AANVRAGEN: UITKERINGEN as ApiResponse<WpiRequestProcess[] | null>,
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
          WPI_TOZO: TOZO as unknown as ApiResponse<WpiRequestProcess[] | null>,
        };

        expect(hasTozo(appState)).toBe(true);
      });

      it('should return false when no content', () => {
        const appState = {
          WPI_TOZO: {} as ApiResponse<WpiRequestProcess[] | null>,
        };
        expect(hasTozo(appState)).toBe(false);
      });
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

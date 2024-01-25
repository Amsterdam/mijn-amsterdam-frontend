import { ApiSuccessResponse } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
import BRP from '../../mock-data/json/brp.json';
import WPI_E from '../../mock-data/json/wpi-e-aanvragen.json';
import VERGUNNINGEN from '../../mock-data/json/vergunningen.json';
import WPI_STADSPAS from '../../mock-data/json/wpi-stadspas.json';
import {
  createTipsFromServiceResults,
  prefixTipNotification,
} from './tips-service';

import {
  vi,
  describe,
  beforeAll,
  beforeEach,
  it,
  expect,
  afterAll,
} from 'vitest';

const TOZO = {
  content: WPI_E.content.filter((c) => c.about === 'Tozo 5'),
  status: 'OK',
};

const TOERISTISCHE_VERHUUR = {
  content: {
    registraties: [],
    vergunningen: VERGUNNINGEN.content.filter(
      (c) => c.caseType === CaseType.VakantieverhuurVergunningaanvraag
    ),
  },
};

describe('createTipsFromServiceResults', () => {
  afterAll(() => {
    vi.useRealTimers();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(vi.getRealSystemTime());
  });

  it('should show tip mijn-36', async () => {
    vi.setSystemTime(new Date('2021-09-25'));

    const TOZO_copy = { ...TOZO };

    TOZO_copy.content[0].decision = 'toekenning';
    TOZO_copy.content[0].datePublished = '2021-07-24';

    const personalTips = await createTipsFromServiceResults('private', {
      serviceResults: {
        WPI_TOZO: TOZO_copy as ApiSuccessResponse<any>,
      },
      tipsDirectlyFromServices: [],
    });

    expect(personalTips.content?.find((t) => t.id === 'mijn-36')).toBeTruthy();
  });

  it('should show tip mijn-35 and mijn-36', async () => {
    vi.setSystemTime(new Date('2021-09-25'));

    const TOZO_copy = { ...TOZO };
    const VERHUUR_copy = { ...TOERISTISCHE_VERHUUR };

    TOZO_copy.content[0].decision = 'toekenning';
    TOZO_copy.content[0].datePublished = '2021-07-24';

    VERHUUR_copy.content.registraties = [];
    VERHUUR_copy.content.vergunningen[0].caseType = CaseType.BBVergunning;

    const tips = await createTipsFromServiceResults('private', {
      serviceResults: {
        WPI_TOZO: TOZO_copy as ApiSuccessResponse<any>,
        TOERISTISCHE_VERHUUR: VERHUUR_copy as ApiSuccessResponse<any>,
        BRP: BRP as ApiSuccessResponse<any>,
      },
      tipsDirectlyFromServices: [],
    });

    expect(
      tips.content?.filter((t) => ['mijn-35', 'mijn-36'].includes(t.id)).length
    ).toBe(2);
  });

  it("should return tip mijn-43 when user has only expired id's", async () => {
    vi.setSystemTime(new Date('2023-11-25'));

    const BRPCopy = { ...BRP };

    BRPCopy.content.identiteitsbewijzen[0].datumAfloop = '2020-07-24';

    const tips = await createTipsFromServiceResults('private', {
      serviceResults: {
        BRP: BRPCopy as ApiSuccessResponse<any>,
        WPI_STADSPAS: {
          content: {
            aanvragen: [],
            ...WPI_STADSPAS.content,
          },
          status: 'OK',
        },
      },
      tipsDirectlyFromServices: [],
    });

    expect(tips.content?.find((t) => t.id === 'mijn-43')).toBeTruthy();
  });

  describe('prefixTipNotification', () => {
    const tip = {
      id: 'test',
      title: 'test',
      description: 'test',
      chapter: 'test',
      datePublished: 'test',
      isTip: true,
      isAlert: false,
      tipReason: 'test',
    };
    it('should prefix a tip notification with "Tip: "', async () => {
      const result = prefixTipNotification(tip);

      expect(result.title).toBe('Tip: test');

      const result2 = prefixTipNotification({
        ...tip,
        title: 'tip: test',
      });

      expect(result2.title).toBe('Tip: test');

      const result3 = prefixTipNotification({
        ...tip,
        title: 'tip test',
      });

      expect(result3.title).toBe('Tip: test');

      const result4 = prefixTipNotification({
        ...tip,
        title: 'tip:test',
      });

      expect(result4.title).toBe('Tip: test');

      const result5 = prefixTipNotification({
        ...tip,
        title: 'test',
      });

      expect(result5.title).toBe('Tip: test');

      const result6 = prefixTipNotification({
        ...tip,
        title: 'Tip: test',
      });

      expect(result6.title).toBe('Tip: test');
    });
  });
});

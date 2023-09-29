import { ApiSuccessResponse } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
import BRP from '../../mock-data/json/brp.json';
import WPI_E from '../../mock-data/json/wpi-e-aanvragen.json';
import VERGUNNINGEN from '../../mock-data/json/vergunningen.json';
import { createTipsFromServiceResults } from './tips-service';

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

  it('should return tip mijn-28 when age is between 17 and 18', async () => {
    vi.setSystemTime(new Date('2022-07-25'));

    const BRPCopy = { ...BRP };

    BRPCopy.content.persoon.geboortedatum = '2005-07-24';

    const tips = await createTipsFromServiceResults('private', {
      serviceResults: {
        BRP: BRPCopy as ApiSuccessResponse<any>,
      },
      tipsDirectlyFromServices: [],
    });

    expect(tips.content?.find((t) => t.id === 'mijn-28')).toBeTruthy();
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
});

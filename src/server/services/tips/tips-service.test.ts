import MockDate from 'mockdate';
import { ApiSuccessResponse } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
import BRP from '../../mock-data/json/brp.json';
import TOZO from './mock-data/tozo.mock.json';
import TOERISTISCHE_VERHUUR from './mock-data/vakantie_verhuur.mock.json';
import { fetchTIPS } from './tips-service';

describe('fetchTIPS', () => {
  afterAll(() => {
    MockDate.reset();
  });

  it('should return the tips in the correct format', async () => {
    const tips = await fetchTIPS(
      { profileType: 'private', optin: 'false' },
      {}
    );

    expect(tips).toMatchSnapshot();
  });

  it('should return tip mijn-28 when age is between 17 and 18', async () => {
    MockDate.set('2022-07-25');

    const BRPCopy = { ...BRP };

    BRPCopy.content.persoon.geboortedatum = '2005-07-24';

    const tips = await fetchTIPS(
      { profileType: 'private', optin: 'true' },
      {
        BRP: BRPCopy as ApiSuccessResponse<any>,
      }
    );

    expect(tips.content?.find((t) => t.id === 'mijn-28')).toBeTruthy();
  });

  it('should return tips when they are active during the date', async () => {
    const tips = await fetchTIPS(
      { profileType: 'private', optin: 'false' },
      {}
    );

    expect(
      tips.content?.some((t) =>
        ['mijn-39', 'mijn-40', 'mijn-41'].includes(t.id)
      )
    ).toBeFalsy();

    MockDate.set('2022-03-14');

    const tipsOnDate = await fetchTIPS(
      { profileType: 'private', optin: 'false' },
      {}
    );

    expect(
      tipsOnDate.content?.filter((t) =>
        ['mijn-39', 'mijn-40', 'mijn-41'].includes(t.id)
      ).length
    ).toBe(3);
  });

  it('should show tip mijn-36', async () => {
    MockDate.set('2021-09-25');

    const TOZO_copy = { ...TOZO };

    TOZO_copy.content[0].decision = 'toekenning';
    TOZO_copy.content[0].datePublished = '2021-07-24';

    const tips = await fetchTIPS(
      { profileType: 'private', optin: 'false' },
      {
        WPI_TOZO: TOZO_copy as ApiSuccessResponse<any>,
      }
    );

    expect(tips.content?.find((t) => t.id === 'mijn-36')).toBeFalsy();

    const personalTips = await fetchTIPS(
      { profileType: 'private', optin: 'true' },
      {
        WPI_TOZO: TOZO_copy as ApiSuccessResponse<any>,
      }
    );

    expect(personalTips.content?.find((t) => t.id === 'mijn-36')).toBeTruthy();
  });

  it('should show tip mijn-35 and mijn-36', async () => {
    MockDate.set('2021-09-25');

    const TOZO_copy = { ...TOZO };
    const VERHUUR_copy = { ...TOERISTISCHE_VERHUUR };

    TOZO_copy.content[0].decision = 'toekenning';
    TOZO_copy.content[0].datePublished = '2021-07-24';

    VERHUUR_copy.content.registraties = [];
    VERHUUR_copy.content.vergunningen[0].caseType = CaseType.BBVergunning;

    const tips = await fetchTIPS(
      { profileType: 'private', optin: 'true' },
      {
        WPI_TOZO: TOZO_copy as ApiSuccessResponse<any>,
        TOERISTISCHE_VERHUUR: VERHUUR_copy as ApiSuccessResponse<any>,
        BRP: BRP as ApiSuccessResponse<any>,
      }
    );

    expect(
      tips.content?.filter((t) => ['mijn-35', 'mijn-36'].includes(t.id)).length
    ).toBe(2);
  });
});

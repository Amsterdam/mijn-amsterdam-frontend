import Mockdate from 'mockdate';

import { fetchZorgnedAanvragenWMO, forTesting } from './wmo-zorgned-service';
import { remoteApiHost } from '../../../testing/setup';
import { remoteApi } from '../../../testing/utils';
import * as request from '../../helpers/source-api-request';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-types';

const mocks = vi.hoisted(() => {
  return {
    mockDocumentIdEncrypted: 'mock-encrypted-document-id',
    mockDocumentId: 'mock-document-id',
  };
});

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  decrypt: vi.fn().mockReturnValue(`session-id:${mocks.mockDocumentId}`),
  encrypt: vi.fn().mockReturnValue([mocks.mockDocumentIdEncrypted, 'xx']),
}));

describe('wmo-zorgned-service', () => {
  const requestData = vi.spyOn(request, 'requestData');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('isProductWithDelivery', () => {
    expect(
      forTesting.isProductWithDelivery({
        leveringsVorm: 'ZIN',
        productsoortCode: 'WRA',
      })
    ).toBe(true);

    expect(
      forTesting.isProductWithDelivery({
        productsoortCode: 'BLA',
        leveringsVorm: 'ZIN',
      })
    ).toBe(false);

    expect(
      forTesting.isProductWithDelivery({
        productsoortCode: 'AO5',
        leveringsVorm: '',
      })
    ).toBe(true);
  });

  test('isActual', () => {
    const aanvraag1 = {
      isActueel: false,
      datumEindeGeldigheid: '',
      datumEindeLevering: '',
      datumBeginLevering: '',
      productsoortCode: 'WRA',
      leveringsVorm: 'ZIN',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag1)).toBe(true);

    const aanvraag2 = {
      isActueel: false,
      datumEindeGeldigheid: '2022-12-31',
      datumEindeLevering: '2023-01-01',
      datumBeginLevering: '2022-12-12',
      productsoortCode: 'WRA',
      leveringsVorm: 'ZIN',
      datumAanvraag: '2022-10-30',
      documenten: [{ title: 'Besluit: xx', datePublished: '2022-11-30' }],
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag2)).toBe(false);

    const aanvraag3 = {
      isActueel: true,
      datumEindeGeldigheid: '2024-01-01',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag3)).toBe(true);

    const aanvraag4 = {
      productsoortCode: 'BLA',
      leveringsVorm: 'BLO',
    } as ZorgnedAanvraagTransformed;

    expect(forTesting.isActueel(aanvraag4)).toBe(false);
  });

  it('should fetch voorzieningen', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, []);
    const BSN = '123456789';
    const result = await fetchZorgnedAanvragenWMO(BSN);

    expect(requestData).toHaveBeenCalledWith({
      url: `${remoteApiHost}/zorgned/aanvragen`,
      data: {
        burgerservicenummer: BSN,
        gemeentecode: ZORGNED_GEMEENTE_CODE,
        maxeinddatum: '2018-01-01',
        regeling: 'wmo',
      },
      transformResponse: expect.any(Function),
      method: 'post',
      headers: {
        Token: process.env.BFF_ZORGNED_API_TOKEN,
        'Content-type': 'application/json; charset=utf-8',
        'x-cache-key-supplement': 'JZD',
      },
      httpsAgent: expect.any(Object),
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "content": [],
        "status": "OK",
      }
    `);
  });

  describe('getFakeDecisionDocuments', () => {
    const aanvraagBase = {
      datumAanvraag: '2023-05-05',
      datumBesluit: '2023-08-05',
      documenten: [],
      resultaat: 'toegewezen',
    };
    const expected = [
      {
        datePublished: '2023-08-05',
        id: 'besluit-document-mist',
        isVisible: false,
        title: 'Besluit: mist',
        url: '',
      },
    ];
    test('Returns fake document', () => {
      expect(
        forTesting.getFakeDecisionDocuments({
          ...aanvraagBase,
          datumBeginLevering: '2023-12-10',
        } as unknown as ZorgnedAanvraagTransformed)
      ).toStrictEqual(expected);
      expect(
        forTesting.getFakeDecisionDocuments({
          ...aanvraagBase,
          datumEindeLevering: '2023-12-10',
        } as unknown as ZorgnedAanvraagTransformed)
      ).toStrictEqual(expected);
      expect(
        forTesting.getFakeDecisionDocuments({
          ...aanvraagBase,
          datumEindeGeldigheid: '2023-12-10',
        } as unknown as ZorgnedAanvraagTransformed)
      ).toStrictEqual(expected);
    });
    test('Does not return fake document', () => {
      expect(
        forTesting.getFakeDecisionDocuments({
          ...aanvraagBase,
          documenten: [
            {
              datePublished: '2023-08-05',
              id: 'doc1',
              isVisible: true,
              title: 'Besluit: aanvraag goedgekeurd',
              url: '/foo/bar',
            },
          ],
        } as unknown as ZorgnedAanvraagTransformed)
      ).toStrictEqual([
        {
          datePublished: '2023-08-05',
          id: 'doc1',
          isVisible: true,
          title: 'Besluit: aanvraag goedgekeurd',
          url: '/foo/bar',
        },
      ]);
    });
  });
});

import Mockdate from 'mockdate';
import { remoteApiHost } from '../../../setupTests';
import { remoteApi } from '../../../test-utils';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { AuthProfileAndToken } from '../../helpers/app';
import * as request from '../../helpers/source-api-request';
import WMO from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { fetchZorgnedAanvragenWMO, forTesting } from './wmo-zorgned-service';
import { ZORGNED_GEMEENTE_CODE } from '../zorgned/zorgned-config-and-types';
import { fetchDocument } from '../zorgned/zorgned-service';

const mocks = vi.hoisted(() => {
  return {
    mockRequestID: 'mock-request-id',
    mockAuthProfileAndToken: {
      profile: {
        id: 'mock-burgerservicenummer',
        profileType: 'private',
        authMethod: 'digid',
        sid: 'session-id',
      },
      token: 'mock-auth-token',
    },
    mockDocumentIdEncrypted: 'mock-encrypted-document-id',
    mockDocumentId: 'mock-document-id',
  };
});

vi.mock('../../../universal/helpers/encrypt-decrypt', () => ({
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
    expect(
      forTesting.assignIsActueel({
        toegewezenProduct: {
          actueel: false,
          datumEindeGeldigheid: '',
        },
        levering: {
          einddatum: '',
          begindatum: '',
        },
        productsoortCode: 'WRA',
        leveringsVorm: 'ZIN',
      } as unknown as Parameters<typeof forTesting.assignIsActueel>[0])
    ).toBe(true);

    expect(
      forTesting.assignIsActueel({
        toegewezenProduct: {
          actueel: false,
          datumEindeGeldigheid: '2022-12-31',
        },
        levering: {
          einddatum: '2023-01-01',
          begindatum: '2022-12-12',
        },
        productsoortCode: 'WRA',
        leveringsVorm: 'ZIN',
      } as unknown as Parameters<typeof forTesting.assignIsActueel>[0])
    ).toBe(false);

    expect(
      forTesting.assignIsActueel({
        toegewezenProduct: {
          actueel: true,
          datumEindeGeldigheid: '2024-01-01',
        },
      } as unknown as Parameters<typeof forTesting.assignIsActueel>[0])
    ).toBe(true);

    expect(
      forTesting.assignIsActueel({
        productsoortCode: 'BLA',
        leveringsVorm: 'BLO',
      } as unknown as Parameters<typeof forTesting.assignIsActueel>[0])
    ).toBe(false);
  });

  it('should fetch voorzieningen', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, []);

    const result = await fetchZorgnedAanvragenWMO(
      mocks.mockRequestID,
      mocks.mockAuthProfileAndToken as AuthProfileAndToken
    );

    expect(requestData).toHaveBeenCalledWith(
      {
        url: `${remoteApiHost}/zorgned/aanvragen`,
        data: {
          burgerservicenummer: mocks.mockAuthProfileAndToken.profile.id,
          gemeentecode: ZORGNED_GEMEENTE_CODE,
          maxeinddatum: '2018-01-01',
          regeling: 'wmo',
        },
        transformResponse: expect.any(Function),
        method: 'post',
        headers: {
          Token: process.env.BFF_ZORGNED_API_TOKEN,
          'Content-type': 'application/json; charset=utf-8',
        },
        httpsAgent: expect.any(Object),
      },
      mocks.mockRequestID,
      mocks.mockAuthProfileAndToken as AuthProfileAndToken
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "content": [],
        "status": "OK",
      }
    `);
  });
});

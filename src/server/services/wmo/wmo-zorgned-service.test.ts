import Mockdate from 'mockdate';
import { remoteApiHost } from '../../../setupTests';
import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import * as request from '../../helpers/source-api-request';
import { ZORGNED_GEMEENTE_CODE } from '../zorgned/zorgned-config-and-types';
import { fetchZorgnedAanvragenWMO, forTesting } from './wmo-zorgned-service';

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
    const aanvraag1 = {
      isActueel: false,
      datumEindeGeldigheid: '',
      datumEindeLevering: '',
      datumBeginLevering: '',
      productsoortCode: 'WRA',
      leveringsVorm: 'ZIN',
    } as unknown as Parameters<typeof forTesting.assignIsActueel>[0];

    forTesting.assignIsActueel(aanvraag1);
    expect(aanvraag1.isActueel).toBe(true);

    const aanvraag2 = {
      isActueel: false,
      datumEindeGeldigheid: '2022-12-31',
      datumEindeLevering: '2023-01-01',
      datumBeginLevering: '2022-12-12',
      productsoortCode: 'WRA',
      leveringsVorm: 'ZIN',
    } as unknown as Parameters<typeof forTesting.assignIsActueel>[0];

    forTesting.assignIsActueel(aanvraag2);
    expect(aanvraag2.isActueel).toBe(false);

    const aanvraag3 = {
      isActueel: true,
      datumEindeGeldigheid: '2024-01-01',
    } as unknown as Parameters<typeof forTesting.assignIsActueel>[0];

    forTesting.assignIsActueel(aanvraag3);

    expect(aanvraag3.isActueel).toBe(true);

    const aanvraag4 = {
      productsoortCode: 'BLA',
      leveringsVorm: 'BLO',
    } as unknown as Parameters<typeof forTesting.assignIsActueel>[0];

    forTesting.assignIsActueel(aanvraag4);

    expect(aanvraag4.isActueel).toBe(false);
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
          'X-Mams-Api-User': 'JZD',
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

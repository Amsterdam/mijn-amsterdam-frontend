import Mockdate from 'mockdate';
import { remoteApiHost } from '../../../setupTests';
import { remoteApi } from '../../../test-utils';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { AuthProfileAndToken } from '../../helpers/app';
import * as request from '../../helpers/source-api-request';
import WMO from '../../mock-data/json/wmo.json';
import {
  WMOSourceResponseData,
  ZORGNED_GEMEENTE_CODE,
} from './config-and-types';
import {
  fetchDocument,
  fetchVoorzieningen,
  forTesting,
} from './wmo-zorgned-service';

const mocks = vi.hoisted(() => {
  return {
    mockRequestID: 'mock-request-id',
    mockAuthProfileAndToken: {
      profile: {
        id: 'mock-burgerservicenummer',
        profileType: 'private',
        authMethod: 'digid',
      },
      token: 'mock-auth-token',
    },
    mockDocumentIdEncrypted: 'mock-encrypted-document-id',
    mockDocumentId: 'mock-document-id',
  };
});

vi.mock('../../../universal/helpers/encrypt-decrypt', () => ({
  decrypt: vi.fn().mockReturnValue(mocks.mockDocumentId),
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

  test('transformDocumenten', () => {
    expect(
      forTesting.transformDocumenten([
        {
          documentidentificatie: 'B73199',
          omschrijving: 'WRA beschikking Definitief',
          datumDefinitief: '2013-05-17T00:00:00',
          zaakidentificatie: null,
        },
      ])
    ).toMatchInlineSnapshot(`
      [
        {
          "datePublished": "2013-05-17T00:00:00",
          "id": "mock-encrypted-document-id",
          "title": "WRA beschikking Definitief",
          "url": "/wmoned/document/mock-encrypted-document-id",
        },
      ]
    `);
  });

  test('isActual', () => {
    expect(
      forTesting.isActual({
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
      } as unknown as Parameters<typeof forTesting.isActual>[0])
    ).toBe(true);

    expect(
      forTesting.isActual({
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
      } as unknown as Parameters<typeof forTesting.isActual>[0])
    ).toBe(false);

    expect(
      forTesting.isActual({
        toegewezenProduct: {
          actueel: true,
          datumEindeGeldigheid: '2024-01-01',
        },
      } as unknown as Parameters<typeof forTesting.isActual>[0])
    ).toBe(true);

    expect(
      forTesting.isActual({
        productsoortCode: 'BLA',
        leveringsVorm: 'BLO',
      } as unknown as Parameters<typeof forTesting.isActual>[0])
    ).toBe(false);
  });

  test('transformAanvraagToVoorziening', () => {
    expect(
      forTesting.transformAanvragenToVoorzieningen(WMO as WMOSourceResponseData)
    ).toMatchSnapshot();

    expect(
      forTesting.transformAanvragenToVoorzieningen(
        null as unknown as WMOSourceResponseData
      )
    ).toStrictEqual([]);
  });

  it('should fetch voorzieningen', async () => {
    remoteApi.post('/zorgned/ojzd/aanvragen').reply(200, []);

    const result = await fetchVoorzieningen(
      mocks.mockRequestID,
      mocks.mockAuthProfileAndToken as AuthProfileAndToken
    );

    expect(requestData).toHaveBeenCalledWith(
      {
        url: `${remoteApiHost}/zorgned/ojzd/aanvragen`,
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

  it('should fetch document successfully', async () => {
    remoteApi.post('/zorgned/ojzd/document').reply(200, {
      inhoud: 'Zm9vLWJhcg==',
      omschrijving: 'Naam documentje',
      mimetype: 'foo/bar',
    });

    const result = await fetchDocument(
      mocks.mockRequestID,
      mocks.mockAuthProfileAndToken as AuthProfileAndToken,
      mocks.mockDocumentIdEncrypted
    );

    expect(requestData).toHaveBeenCalledWith(
      {
        url: `${remoteApiHost}/zorgned/ojzd/document`,
        data: {
          burgerservicenummer: mocks.mockAuthProfileAndToken.profile.id,
          gemeentecode: ZORGNED_GEMEENTE_CODE,
          documentidentificatie: mocks.mockDocumentId,
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

    expect(decrypt).toHaveBeenCalledWith(mocks.mockDocumentIdEncrypted);

    expect(result).toEqual({
      status: 'OK',
      content: {
        title: 'Naam documentje',
        mimetype: 'foo/bar',
        data: Buffer.from('Zm9vLWJhcg==', 'base64'),
      },
    });
  });
});

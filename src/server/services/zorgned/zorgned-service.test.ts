import { fetchAanvragen, fetchDocument, forTesting } from './zorgned-service';
import Mockdate from 'mockdate';
import { remoteApiHost } from '../../../setupTests';
import { remoteApi } from '../../../test-utils';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { AuthProfileAndToken } from '../../helpers/app';
import * as request from '../../helpers/source-api-request';
import ZorgnedVragenWMO from '../../mock-data/json/zorgned-wmo-aanvragen.json';
import {
  ZorgnedResponseDataSource,
  ZORGNED_GEMEENTE_CODE,
} from './zorgned-config-and-types';

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

describe('zorgned-service', () => {
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
          "id": "B73199",
          "title": "WRA beschikking Definitief",
          "url": "",
        },
      ]
    `);
    expect(
      forTesting.transformDocumenten([
        {
          documentidentificatie: 'B73199',
          omschrijving: 'WRA beschikking Definitief',
          datumDefinitief: null,
          zaakidentificatie: null,
        },
      ])
    ).toStrictEqual([]);
  });

  test('transformZorgnedAanvragen', () => {
    expect(
      forTesting.transformZorgnedAanvragen(
        ZorgnedVragenWMO as ZorgnedResponseDataSource
      )
    ).toMatchSnapshot();

    expect(
      forTesting.transformZorgnedAanvragen(
        null as unknown as ZorgnedResponseDataSource
      )
    ).toStrictEqual([]);
  });

  it('should fetch aanvragen', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, []);

    const result = await fetchAanvragen(
      mocks.mockRequestID,
      mocks.mockAuthProfileAndToken as AuthProfileAndToken,
      'ZORGNED_JZD',
      {
        maxeinddatum: '2018-01-01',
        regeling: 'wmo',
      }
    );

    expect(requestData).toHaveBeenCalledWith(
      {
        url: `${remoteApiHost}/zorgned/aanvragen`,
        data: {
          maxeinddatum: '2018-01-01',
          regeling: 'wmo',
          burgerservicenummer: mocks.mockAuthProfileAndToken.profile.id,
          gemeentecode: ZORGNED_GEMEENTE_CODE,
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

  it('should fetch document error (non matching session id)', async () => {
    remoteApi.post('/zorgned/document').reply(200, '');

    const result = await forTesting.fetchDocument(
      mocks.mockRequestID,
      {
        ...mocks.mockAuthProfileAndToken,
        profile: { sid: 'nope' },
      } as AuthProfileAndToken,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "Error: No document content",
        "status": "ERROR",
      }
    `);
  });

  it('should fetch document successfully', async () => {
    remoteApi.post('/zorgned/document').reply(200, {
      inhoud: 'Zm9vLWJhcg==',
      omschrijving: 'Naam documentje',
      mimetype: 'foo/bar',
    });

    const result = await fetchDocument(
      mocks.mockRequestID,
      mocks.mockAuthProfileAndToken as AuthProfileAndToken,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(requestData).toHaveBeenCalledWith(
      {
        url: `${remoteApiHost}/zorgned/document`,
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

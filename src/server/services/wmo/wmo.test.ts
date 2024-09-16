import Mockdate from 'mockdate';
import ZORGNED_AANVRAGEN_WMO from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { remoteApi } from '../../../test-utils';
import { jsonCopy } from '../../../universal/helpers/utils';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types';
import { fetchWmo, forTesting } from './wmo';

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  encryptSessionIdWithRouteIdParam: vi.fn().mockReturnValue('123-123-123-123'),
}));

describe('Transform api items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('fetchWmo', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_AANVRAGEN_WMO);

    expect(
      await fetchWmo('xxxx', {
        profile: {
          id: '123123',
          authMethod: 'digid',
          profileType: 'private',
          sid: '',
        },
        token: '',
      })
    ).toMatchSnapshot();
  });

  describe('getDocuments', () => {
    const aanvraag = {
      datumAanvraag: '2024-06-14',
      documenten: [
        {
          id: 'document-1',
          title: 'Document 1',
          datePublished: '2024-06-24',
          url: '',
        },
      ],
    } as ZorgnedAanvraagTransformed;

    test('Assign documents after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(forTesting.getDocuments('xxx-222', jsonCopy(aanvraag)))
        .toMatchInlineSnapshot(`
          [
            {
              "datePublished": "2024-06-24",
              "id": "document-1",
              "title": "Document 1",
              "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
            },
          ]
        `);
    });

    test('Assign documents before MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.getDocuments(
          'xxx-222',
          jsonCopy({ ...aanvraag, datumAanvraag: '2017-04-12' })
        )
      ).toMatchInlineSnapshot(`[]`);
    });

    test('Assign documents with multiple docs after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      const aanvraag2: ZorgnedAanvraagTransformed = jsonCopy(aanvraag);

      aanvraag2.documenten[1] = aanvraag2.documenten[0];

      expect(aanvraag2.documenten.length).toBe(2);

      expect(forTesting.getDocuments('xxx-222', aanvraag2))
        .toMatchInlineSnapshot(`
        [
          {
            "datePublished": "2024-06-24",
            "id": "document-1",
            "title": "Document 1",
            "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
          },
          {
            "datePublished": "2024-06-24",
            "id": "document-1",
            "title": "Document 1",
            "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
          },
        ]
      `);
    });
  });
});

import Mockdate from 'mockdate';
import { remoteApi } from '../../../test-utils';
import ZORGNED_AANVRAGEN_WMO from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { fetchWmo, forTesting } from './wmo';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { StatusLineItem } from '../../../universal/types';
import { jsonCopy } from '../../../universal/helpers';

vi.mock('../../../universal/helpers/encrypt-decrypt', () => ({
  encrypt: vi.fn().mockReturnValue(['123-123-123-123', 'xx']),
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

  describe('addDocumentLinksToLineItems', () => {
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

    const lineItems: StatusLineItem[] = [
      {
        id: 'step-1',
        datePublished: '2024-06-24',
        status: 'Besluit',
      },
    ];

    test('Assign documents after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.addDocumentLinksToLineItems(
          'xx1xx',
          jsonCopy(aanvraag),
          jsonCopy(lineItems)
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "datePublished": "2024-06-24",
            "documents": [
              {
                "datePublished": "2024-06-24",
                "id": "document-1",
                "title": "Brief",
                "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
              },
            ],
            "id": "step-1",
            "status": "Besluit",
          },
        ]
      `);
    });

    test('Assign documents before MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.addDocumentLinksToLineItems(
          'xx1xx',
          jsonCopy({ ...aanvraag, datumAanvraag: '2017-04-12' }),
          jsonCopy(lineItems)
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "altDocumentContent": "<p>
                      <strong>
                        Verstuurd per post
                      </strong>
                    </p>",
            "datePublished": "2024-06-24",
            "id": "step-1",
            "status": "Besluit",
          },
        ]
      `);
    });

    test('Assign documents with multiple docs after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      const lineItems2: StatusLineItem[] = jsonCopy(lineItems);
      const aanvraag2: ZorgnedAanvraagTransformed = jsonCopy(aanvraag);

      aanvraag2.documenten[1] = aanvraag2.documenten[0];

      expect(aanvraag2.documenten.length).toBe(2);

      expect(
        forTesting.addDocumentLinksToLineItems('xx1xx', aanvraag2, lineItems2)
      ).toMatchInlineSnapshot(`
        [
          {
            "altDocumentContent": "<p>
                      <strong>
                        Verstuurd per post
                      </strong>
                    </p>",
            "datePublished": "2024-06-24",
            "id": "step-1",
            "status": "Besluit",
          },
        ]
      `);
    });
  });
});

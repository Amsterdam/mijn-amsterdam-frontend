import Mockdate from 'mockdate';
import ZORGNED_AANVRAGEN_WMO from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { remoteApi } from '../../../test-utils';
import { jsonCopy } from '../../../universal/helpers/utils';
import { StatusLineItem } from '../../../universal/types';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { fetchWmo, forTesting } from './wmo';

vi.mock('../../../server/helpers/encrypt-decrypt', () => ({
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

  describe('addAltDocumentContentToLineItems', () => {
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
        isActive: true,
        isChecked: true,
      },
    ];

    test('Assign documents after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.addAltDocumentContentToLineItems(
          jsonCopy(aanvraag),
          jsonCopy(lineItems)
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "altDocumentContent": "<p><strong>Dit document staat bij documenten bovenaan deze pagina</strong></p>",
            "datePublished": "2024-06-24",
            "id": "step-1",
            "isActive": true,
            "isChecked": true,
            "status": "Besluit",
          },
        ]
      `);
    });

    test('Assign documents before MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.addAltDocumentContentToLineItems(
          jsonCopy({ ...aanvraag, datumAanvraag: '2017-04-12' }),
          jsonCopy(lineItems)
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "altDocumentContent": "<p><strong>Verstuurd per post</strong></p>",
            "datePublished": "2024-06-24",
            "id": "step-1",
            "isActive": true,
            "isChecked": true,
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

      expect(forTesting.addAltDocumentContentToLineItems(aanvraag2, lineItems2))
        .toMatchInlineSnapshot(`
          [
            {
              "altDocumentContent": "<p><strong>Verstuurd per post</strong></p>",
              "datePublished": "2024-06-24",
              "id": "step-1",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit",
            },
          ]
        `);
    });
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
              "title": "Brief",
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
        .toMatchInlineSnapshot(`[]`);
    });
  });
});

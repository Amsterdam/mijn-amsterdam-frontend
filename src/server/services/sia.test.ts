import { describe, expect, test, vi } from 'vitest';
import { remoteApi } from '../../test-utils';
import { jsonCopy } from '../../universal/helpers';
import {
  SiaAttachmentResponse,
  SiaSignalHistory,
  SignalPrivate,
  StatusStateChoice,
  fetchSignalAttachments,
  forTesting,
} from './sia';

const SIGNAL_ID_ENCRYPTED = 'xxxxxxxxxx-encrypted-xxxxxxxxxxx';
const SIGNAL_ID_DECRYPTED = 'x1x2x3x4x5x';

vi.mock('../../universal/helpers/encrypt-decrypt', async (requireActual) => {
  const origModule = (await requireActual()) as object;
  return {
    ...origModule,
    encrypt: (value: string) => [SIGNAL_ID_ENCRYPTED],
    decrypt: () => SIGNAL_ID_DECRYPTED,
  };
});

const testHistory: SiaSignalHistory[] = [
  {
    identifier: 'UPDATE_STATUS_24672',
    when: '2023-03-22T09:43:15.024700+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Gemeld',
    description: null,
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24675',
    when: '2023-03-22T11:44:04.889572+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Ingepland',
    description: 'testen mijn meldingen',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24674',
    when: '2023-03-22T11:43:53.784335+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Ingepland',
    description: 'testen mijn meldingen',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24676',
    when: '2023-03-22T11:44:29.032811+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Reactie gevraagd',
    description: 'Kunt u deze dingen nog vermelden?',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'CREATE_NOTE_13093',
    when: '2023-03-22T09:43:15.414041+01:00',
    what: 'CREATE_NOTE',
    action: 'Notitie toegevoegd:',
    description:
      'Automatische e-mail bij registratie van de melding is verzonden aan de melder.',
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_TYPE_ASSIGNMENT_12536',
    when: '2023-03-22T09:43:15.058718+01:00',
    what: 'UPDATE_TYPE_ASSIGNMENT',
    action: 'Type gewijzigd naar: Melding',
    description: null,
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_PRIORITY_14210',
    when: '2023-03-22T09:43:15.048786+01:00',
    what: 'UPDATE_PRIORITY',
    action: 'Urgentie gewijzigd naar: Normaal',
    description: null,
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_CATEGORY_ASSIGNMENT_19321',
    when: '2023-03-22T09:43:15.041899+01:00',
    what: 'UPDATE_CATEGORY_ASSIGNMENT',
    action: 'Categorie gewijzigd naar: Overig afval',
    description: null,
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24675',
    when: '2023-03-23T11:44:29.032811+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Reactie ontvangen',
    description: 'U heeft het voor elkaar!',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_243372',
    when: '2023-03-22T11:45:15.024700+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Gemeld',
    description: null,
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24681',
    when: '2023-03-22T11:48:10.750252+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Afgehandeld',
    description: 'testen mijn meldingen',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24680',
    when: '2023-03-22T11:47:32.549606+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Heropend',
    description: 'testen mijn meldingen',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_24672',
    when: '2023-03-27T09:43:15.024700+01:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Gemeld',
    description: null,
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'CREATE_NOTE_14279',
    when: '2023-06-12T11:55:50.716996+02:00',
    what: 'CREATE_NOTE',
    action: 'Notitie toegevoegd:',
    description:
      'Automatische e-mail bij inplannen is verzonden aan de melder.',
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_25573',
    when: '2023-06-12T11:55:50.424360+02:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Ingepland',
    description: 'Wij gaan er z.s.m mee aan de gang en houden u op de hoogte.',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
  {
    identifier: 'CREATE_NOTE_142791',
    when: '2023-06-12T11:57:50.716996+02:00',
    what: 'CREATE_NOTE',
    action: 'Notitie toegevoegd:',
    description:
      'Automatische e-mail bij inplannen is verzonden aan de melder.',
    who: 'Signalen systeem',
    _signal: 123123123,
  },
  {
    identifier: 'UPDATE_STATUS_255731',
    when: '2023-06-12T11:57:50.424360+02:00',
    what: 'UPDATE_STATUS',
    action: 'Status gewijzigd naar: Fake status',
    description: 'Dingen die we niet willen laten zien',
    who: 'hela.hola@amsterdam.nl',
    _signal: 123123123,
  },
];

const siaResponse: /*SignalsSourceData*/ any = {
  _links: {
    self: {
      href: 'https://localhost/signals/v1/private/signals/?contact_details=email&reporter_email=hela.hola%40amsterdam.nl',
    },
    next: {
      href: null,
    },
    previous: {
      href: null,
    },
  },
  count: 3,
  results: [
    {
      _links: {
        self: {
          href: 'https://localhost/signals/v1/private/signals/12419',
        },
      },
      _display: '12419 - m - None - 2023-03-30T14:04:43.764584+02:00',
      id: 12419,
      id_display: 'SIG-12419',
      signal_id: 'cd11e70c-c90d-4a8d-b345-7a9a69fc0f76',
      source: 'Interne melding',
      text: 'Grab the snapshot and use set to mutate state immediately, and call getLoadable with the query and parameter to fire the request. The order between set and getLoadable does not matter because whaleInfoQuery already calls the query with the necessary parameter. The set guarantees a mutation to the whale id when the component re-renders.\n\nTo prove this pre-fetch works, set a breakpoint in whaleInfoQuery right as fetch gets called. Examine the call stack and look for CurrentWhaleTypes at the bottom of the stack — this executes the onClick event. If it happens to be CurrentWhalePick, the request fired at re-render and not in the click event.\n\nSwapping the query between pre-fetch and re-render is possible via useSetRecoilState and changeWhale. The repo on GitHub has the exchangeable code commented out. I recommend playing with this: swap to re-render and take a look at the call stack. Changing back to pre-fetch calls the query from the click event.',
      text_extra: '',
      status: {
        text: '',
        user: null,
        state: 'm',
        state_display: 'Gemeld',
        target_api: null,
        extra_properties: null,
        send_email: false,
        created_at: '2023-03-30T14:04:43.829825+02:00',
        email_override: null,
      },
      location: {
        id: 13394,
        stadsdeel: 'A',
        buurt_code: null,
        area_type_code: null,
        area_code: null,
        area_name: null,
        address: {
          postcode: '1015RT',
          huisletter: '',
          huisnummer: 1,
          woonplaats: 'Amsterdam',
          openbare_ruimte: 'Eerste Tuindwarsstraat',
          huisnummer_toevoeging: '2V',
        },
        address_text: 'Eerste Tuindwarsstraat 1-2V 1015RT Amsterdam',
        geometrie: {
          type: 'Point',
          coordinates: [4.883837264102948, 52.37778548459913],
        },
        extra_properties: {
          original_address: {
            postcode: '1015RT',
            huisnummer: '1-2V',
            woonplaats: 'Amsterdam',
            openbare_ruimte: 'Eerste Tuindwarsstraat',
          },
        },
        created_by: null,
        bag_validated: true,
      },
      category: {
        sub: 'Overig',
        sub_slug: 'overig',
        main: 'Overig',
        main_slug: 'overig',
        category_url:
          'https://localhost/signals/v1/public/terms/categories/overig/sub_categories/overig',
        departments: 'ASC',
        created_by: null,
        text: null,
        deadline: '2023-04-06T14:04:43.764584+02:00',
        deadline_factor_3: '2023-04-20T14:04:43.764584+02:00',
      },
      reporter: {
        email: 'hela.hola@amsterdam.nl',
        phone: '065656565656',
        sharing_allowed: false,
        allows_contact: true,
      },
      priority: {
        priority: 'normal',
        created_by: null,
      },
      type: {
        code: 'SIG',
        created_at: '2023-03-30T14:04:43.860793+02:00',
        created_by: null,
      },
      created_at: '2023-03-30T14:04:43.764584+02:00',
      updated_at: '2023-03-30T14:04:44.660889+02:00',
      incident_date_start: '2023-03-30T14:04:43+02:00',
      incident_date_end: null,
      operational_date: null,
      has_attachments: true,
      extra_properties: null,
      notes: [
        {
          text: 'Bijlage toegevoegd door melder: 68c2c8889fbc89c6b7ea6e03c669610e.jpg',
          created_by: null,
        },
        {
          text: 'Bijlage toegevoegd door melder: 6a305345cdcc0e1186d7dcb7803e386a.jpg',
          created_by: null,
        },
        {
          text: 'Automatische e-mail bij registratie van de melding is verzonden aan de melder.',
          created_by: null,
        },
      ],
      routing_departments: null,
      has_parent: false,
      has_children: false,
      assigned_user_email: null,
    },
  ],
};

const attachmentsSample: SiaAttachmentResponse = {
  _links: {
    self: {
      href: 'string',
    },
    next: {
      href: 'string',
    },
    previous: {
      href: null,
    },
  },
  count: 1,
  results: [
    {
      _display: 'Attachment object (1)',
      _links: {
        self: {
          href: 'string',
        },
      },
      location: '/signals/media/images/2020/01/01/happy-new-year.jpg',
      is_image: true,
      created_at: '2020-01-01T00:00:00+00:00',
      created_by: 'someuser@example.com',
    },
  ],
};

describe('sia service', () => {
  test('transformSiaHistoryLogResponse', () => {
    const history = forTesting.transformSiaHistoryLogResponse(testHistory);

    expect(history).toMatchInlineSnapshot(`
      [
        {
          "datePublished": "2023-03-22T09:43:15.024700+01:00",
          "description": "",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
        {
          "datePublished": "2023-03-22T11:43:53.784335+01:00",
          "description": "",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
        {
          "datePublished": "2023-03-22T11:44:04.889572+01:00",
          "description": "",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
        {
          "datePublished": "2023-03-22T11:44:29.032811+01:00",
          "description": "Kunt u deze dingen nog vermelden?",
          "key": "UPDATE_STATUS",
          "status": "Vraag aan u verstuurd",
        },
        {
          "datePublished": "2023-03-22T11:45:15.024700+01:00",
          "description": "",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
        {
          "datePublished": "2023-03-22T11:47:32.549606+01:00",
          "description": "testen mijn meldingen",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
        {
          "datePublished": "2023-03-22T11:48:10.750252+01:00",
          "description": "testen mijn meldingen",
          "key": "UPDATE_STATUS",
          "status": "Afgesloten",
        },
        {
          "datePublished": "2023-03-23T11:44:29.032811+01:00",
          "description": "U heeft het voor elkaar!",
          "key": "UPDATE_STATUS",
          "status": "Antwoord van u ontvangen",
        },
        {
          "datePublished": "2023-03-27T09:43:15.024700+01:00",
          "description": "",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
        {
          "datePublished": "2023-06-12T11:55:50.424360+02:00",
          "description": "Wij gaan er z.s.m mee aan de gang en houden u op de hoogte.",
          "key": "UPDATE_STATUS",
          "status": "Open",
        },
      ]
    `);
  });

  test('transformSiaAttachmentsResponse', () => {
    const attachments =
      forTesting.transformSiaAttachmentsResponse(attachmentsSample);

    expect(attachments).toMatchInlineSnapshot(`
      [
        {
          "isImage": true,
          "url": "/signals/media/images/2020/01/01/happy-new-year.jpg",
        },
      ]
    `);
  });

  test('transformSiaAttachmentsResponse.empty', () => {
    const attachments = forTesting.transformSiaAttachmentsResponse(
      null as unknown as SiaAttachmentResponse
    );

    expect(attachments).toMatchInlineSnapshot('[]');
  });

  test('transformSIAData - Open', () => {
    const siaItems = forTesting.transformSIAData(siaResponse);

    expect(siaItems).toMatchInlineSnapshot(`
      {
        "items": [
          {
            "address": "Eerste Tuindwarsstraat 1  2V
      1015RT Amsterdam",
            "category": "Overig",
            "dateClosed": "",
            "dateIncidentEnd": null,
            "dateIncidentStart": "2023-03-30T14:04:43+02:00",
            "dateModified": "2023-03-30T14:04:44.660889+02:00",
            "datePublished": "2023-03-30T14:04:43.764584+02:00",
            "description": "Grab the snapshot and use set to mutate state immediately, and call getLoadable with the query and parameter to fire the request. The order between set and getLoadable does not matter because whaleInfoQuery already calls the query with the necessary parameter. The set guarantees a mutation to the whale id when the component re-renders.

      To prove this pre-fetch works, set a breakpoint in whaleInfoQuery right as fetch gets called. Examine the call stack and look for CurrentWhaleTypes at the bottom of the stack — this executes the onClick event. If it happens to be CurrentWhalePick, the request fired at re-render and not in the click event.

      Swapping the query between pre-fetch and re-render is possible via useSetRecoilState and changeWhale. The repo on GitHub has the exchangeable code commented out. I recommend playing with this: swap to re-render and take a look at the call stack. Changing back to pre-fetch calls the query from the click event.",
            "email": "hela.hola@amsterdam.nl",
            "hasAttachments": true,
            "id": "xxxxxxxxxx-encrypted-xxxxxxxxxxx",
            "identifier": "SIG-12419",
            "latlon": {
              "lat": 52.37778548459913,
              "lng": 4.883837264102948,
            },
            "link": {
              "title": "SIA Melding SIG-12419",
              "to": "/detail-open-melding/SIG-12419",
            },
            "phone": "065656565656",
            "status": "Open",
          },
        ],
        "pageSize": 50,
        "total": 3,
      }
    `);
  });

  test('transformSIAData - Closed', () => {
    const siaResponseCopy = jsonCopy(siaResponse);

    siaResponseCopy.results[0].status.state = 'o';

    const attachments = forTesting.transformSIAData(siaResponseCopy);

    expect(attachments).toMatchInlineSnapshot(`
      {
        "items": [
          {
            "address": "Eerste Tuindwarsstraat 1  2V
      1015RT Amsterdam",
            "category": "Overig",
            "dateClosed": "2023-03-30T14:04:44.660889+02:00",
            "dateIncidentEnd": null,
            "dateIncidentStart": "2023-03-30T14:04:43+02:00",
            "dateModified": "2023-03-30T14:04:44.660889+02:00",
            "datePublished": "2023-03-30T14:04:43.764584+02:00",
            "description": "Grab the snapshot and use set to mutate state immediately, and call getLoadable with the query and parameter to fire the request. The order between set and getLoadable does not matter because whaleInfoQuery already calls the query with the necessary parameter. The set guarantees a mutation to the whale id when the component re-renders.

      To prove this pre-fetch works, set a breakpoint in whaleInfoQuery right as fetch gets called. Examine the call stack and look for CurrentWhaleTypes at the bottom of the stack — this executes the onClick event. If it happens to be CurrentWhalePick, the request fired at re-render and not in the click event.

      Swapping the query between pre-fetch and re-render is possible via useSetRecoilState and changeWhale. The repo on GitHub has the exchangeable code commented out. I recommend playing with this: swap to re-render and take a look at the call stack. Changing back to pre-fetch calls the query from the click event.",
            "email": "hela.hola@amsterdam.nl",
            "hasAttachments": true,
            "id": "xxxxxxxxxx-encrypted-xxxxxxxxxxx",
            "identifier": "SIG-12419",
            "latlon": {
              "lat": 52.37778548459913,
              "lng": 4.883837264102948,
            },
            "link": {
              "title": "SIA Melding SIG-12419",
              "to": "/detail-afgesloten-melding/SIG-12419",
            },
            "phone": "065656565656",
            "status": "Afgesloten",
          },
        ],
        "pageSize": 50,
        "total": 3,
      }
    `);
  });

  test('getSignalStatus', () => {
    const signalMock = (state: StatusStateChoice) => {
      return {
        status: { state },
      } as unknown as SignalPrivate;
    };

    Object.entries(forTesting.STATUS_CHOICES_MA).forEach(([key, value]) => {
      expect(
        forTesting.getSignalStatus(signalMock(key as StatusStateChoice))
      ).toBe(value);
    });
  });

  test('fetch signal attachments', async () => {
    remoteApi.post('/sia-iam-token').reply(200, 'token');
    remoteApi
      .get(`/sia/private/signals/${SIGNAL_ID_DECRYPTED}/attachments`)
      .reply(200, {
        results: [
          { location: '/1', is_image: false },
          { location: '/2', is_image: true },
        ],
      });

    const response = await fetchSignalAttachments(
      'xx-request-id-xx',
      {
        token: '',
        profile: {
          id: 'hm',
          authMethod: 'yivi',
          profileType: 'private-attributes',
          sid: '',
        },
      },
      SIGNAL_ID_ENCRYPTED
    );

    expect(response).toStrictEqual({
      content: [
        { url: '/1', isImage: false },
        { url: '/2', isImage: true },
      ],
      status: 'OK',
    });
  });
});

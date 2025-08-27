import { fetchBedAndBreakfast } from './bed-and-breakfast';
import { getAuthProfileAndToken, remoteApi } from '../../../../testing/utils';

vi.mock(
  '../../../../server/helpers/encrypt-decrypt',
  async (requireActual: () => object | PromiseLike<object>) => {
    return {
      ...((await requireActual()) as object),
      encryptSessionIdWithRouteIdParam: () => {
        return 'test-encrypted-id';
      },
      decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
    };
  }
);

describe('Regressietest fetchBedAndBreakfast personen', () => {
  const PowerBrowserPersonenRequests = [
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/SearchRequest',
        method: 'POST',
      },
      res: {
        mainTableName: 'PERSONEN',
        records: [
          {
            fmtCpn: 'A. van Dam',
            mainTableName: 'PERSONEN',
            id: '87654321',
          },
        ],
      },
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/Link/PERSONEN/GFO_ZAKEN/Table',
        method: 'POST',
      },
      res: {
        mainTableName: 'GFO_ZAKEN',
        records: [
          {
            fmtCpn:
              'Z2025-WK000081 BenB aanvragen - Speelmanstraat 5 H 15-04-2025 In behandeling Vergunningaanvraag behandelen Bed en breakfast',
            mainTableName: 'GFO_ZAKEN',
            id: '126089897',
            fields: [
              {
                fieldName: 'FMT_CAPTION',
                text: 'Z2025-WK000081 BenB aanvragen - Speelmanstraat 5 H 15-04-2025 In behandeling Vergunningaanvraag behandelen Bed en breakfast ',
                fieldValue:
                  'Z2025-WK000081 BenB aanvragen - Speelmanstraat 5 H 15-04-2025 In behandeling Vergunningaanvraag behandelen Bed en breakfast ',
              },
            ],
          },
        ],
      },
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/record/GFO_ZAKEN/126089897',
        method: 'GET',
      },
      res: [
        {
          fmtCpn:
            'Z2025-WK000081 BenB aanvragen - Speelmanstraat 5 H 15-04-2025 In behandeling Vergunningaanvraag behandelen Bed en breakfast',
          mainTableName: 'GFO_ZAKEN',
          id: '126089897',
          fields: [
            {
              fieldName: 'ZAAK_IDENTIFICATIE',
              text: 'Z2025-WK000081',
              fieldValue: 'Z2025-WK000081',
            },
            {
              fieldName: 'STARTDATUM',
              text: '15-04-2025',
              fieldValue: '2025-04-14T22:00:00.0000000Z',
            },
            {
              fieldName: 'EINDDATUM',
            },
            {
              fieldName: 'DATUM_TOT',
              text: '01-07-2028',
              fieldValue: '2028-06-30T22:00:00.0000000Z',
            },
          ],
        },
      ],
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/Link/GFO_ZAKEN/ADRESSEN/Table',
        method: 'POST',
      },
      res: {
        mainTableName: 'ADRESSEN',
        records: [
          {
            fmtCpn: 'Speelmanstraat 5-H 1063ZC Amsterdam',
            mainTableName: 'ADRESSEN',
            id: '126026812',
            fields: [
              {
                fieldName: 'FMT_CAPTION',
                text: 'Speelmanstraat 5-H 1063ZC Amsterdam',
                fieldValue: 'Speelmanstraat 5-H 1063ZC Amsterdam',
              },
            ],
          },
        ],
      },
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/Report/RunSavedReport',
        method: 'POST',
      },
      res: [
        {
          omschrijving: 'Intake',
          datum: '2025-04-14T22:00:00.0000000Z',
        },
        {
          omschrijving: 'In behandeling',
          datum: '2025-04-14T22:00:00.0000000Z',
        },
      ],
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/SearchRequest',
        method: 'POST',
      },
      res: {
        mainTableName: 'DOCLINK',
        records: [
          {
            fmtCpn: 'Situatieschets-Plattegrond.pdf D2025-04-000046',
            mainTableName: 'DOCLINK',
            id: '1191011',
            fields: [
              {
                fieldName: 'CREATEDATE',
                text: '15-04-2025 00:00',
                fieldValue: '2025-04-14T22:00:00.0000000Z',
              },
              {
                fieldName: 'OMSCHRIJVING',
                text: 'Situatieschets-Plattegrond.pdf',
                fieldValue: 'Situatieschets-Plattegrond.pdf',
              },
              {
                fieldName: 'ID',
                text: '1191011',
                fieldValue: '1191011',
              },
              {
                fieldName: 'FMT_CAPTION',
                text: 'Situatieschets-Plattegrond.pdf D2025-04-000046 ',
                fieldValue: 'Situatieschets-Plattegrond.pdf D2025-04-000046 ',
              },
            ],
          },
          {
            fmtCpn: '15-4-2025_Samenvatting_1063ZC5H.pdf D2025-04-000047',
            mainTableName: 'DOCLINK',
            id: '1191012',
            fields: [
              {
                fieldName: 'CREATEDATE',
                text: '15-04-2025 00:00',
                fieldValue: '2025-04-14T22:00:00.0000000Z',
              },
              {
                fieldName: 'OMSCHRIJVING',
                text: '15-4-2025_Samenvatting_1063ZC5H.pdf',
                fieldValue: '15-4-2025_Samenvatting_1063ZC5H.pdf',
              },
              {
                fieldName: 'DOCUMENTNR',
                text: 'D2025-04-000047',
                fieldValue: 'D2025-04-000047',
              },
              {
                fieldName: 'ID',
                text: '1191012',
                fieldValue: '1191012',
              },
            ],
          },
        ],
      },
    },
  ];

  const expectedBBResponse = {
    caseType: 'Bed en breakfast',
    dateRequest: '2025-04-14T22:00:00.0000000Z',
    dateRequestFormatted: '15 april 2025',
    dateDecision: null,
    dateDecisionFormatted: '-',
    dateStart: '',
    dateStartFormatted: '-',
    dateEnd: '',
    dateEndFormatted: '-',
    decision: null,
    isVerleend: false,
    id: '126089897',
    identifier: 'Z2025-WK000081',
    link: {
      to: '/toeristische-verhuur/vergunning/bed-and-breakfast/126089897',
      title: 'Vergunning bed & breakfast',
    },
    title: 'Vergunning bed & breakfast',
    processed: false,
    isExpired: false,
    location: 'Speelmanstraat 5-H \n1063ZC Amsterdam',
    displayStatus: 'In behandeling',
    documents: [
      {
        id: 'test-encrypted-id',
        title: 'Samenvatting aanvraagformulier',
        url: 'http://bff-api-host/api/v1/services/3448915414/documents/download?id=test-encrypted-id',
        download: 'Samenvatting aanvraagformulier',
        datePublished: '2025-04-14T22:00:00.0000000Z',
      },
    ],
    steps: [
      {
        id: 'step-1',
        status: 'Ontvangen',
        datePublished: '2025-04-14T22:00:00.0000000Z',
        isActive: false,
        isChecked: true,
      },
      {
        id: 'step-2',
        status: 'In behandeling',
        datePublished: '2025-04-14T22:00:00.0000000Z',
        isActive: true,
        isChecked: true,
      },
      {
        id: 'step-3',
        status: 'Afgehandeld',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ],
    heeftOvergangsRecht: false,
  };
  test('should fetch BB zaken successfully', async () => {
    for (const r of PowerBrowserPersonenRequests) {
      const method = r.req.method.toLowerCase();
      const url = r.req.url.replace(
        'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/',
        '/powerbrowser/'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (remoteApi as any)[method](url).reply(200, r.res);
    }
    const authProfileAndToken = getAuthProfileAndToken();

    authProfileAndToken.profile.id = '12345678';
    const result = await fetchBedAndBreakfast(authProfileAndToken.profile);
    expect(result.status).toBe('OK');
    expect(result.content).toEqual([expectedBBResponse]);
  });
});

describe.only('fetchBB fetchBedAndBreakfast maatschap', () => {
  const PowerBrowserMaatschapRequests = [
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/SearchRequest',
        method: 'POST',
      },
      res: {
        mainTableName: 'MAATSCHAP',
        records: [
          {
            fmtCpn: 'Logozorg 22345678',
            mainTableName: 'MAATSCHAP',
            id: '12345678',
          },
        ],
      },
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/Link/MAATSCHAP/GFO_ZAKEN/Table',
        method: 'POST',
      },
      res: {
        mainTableName: 'GFO_ZAKEN',
        records: [
          {
            fmtCpn:
              'Z2025-WK000108 BenB aanvragen - Paulus van Hemertstraat 2 2 27-05-2025 Intake Vergunningaanvraag behandelen Bed en breakfast',
            mainTableName: 'GFO_ZAKEN',
            id: '987654321',
            fields: [
              {
                fieldName: 'FMT_CAPTION',
                text: 'Z2025-WK000108 BenB aanvragen - Paulus van Hemertstraat 2 2 27-05-2025 Intake Vergunningaanvraag behandelen Bed en breakfast ',
                fieldValue:
                  'Z2025-WK000108 BenB aanvragen - Paulus van Hemertstraat 2 2 27-05-2025 Intake Vergunningaanvraag behandelen Bed en breakfast ',
              },
            ],
          },
        ],
      },
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/record/GFO_ZAKEN/987654321',
        method: 'GET',
      },
      res: [
        {
          fmtCpn:
            'Z2025-WK000108 BenB aanvragen - Paulus van Hemertstraat 2 2 27-05-2025 Intake Vergunningaanvraag behandelen Bed en breakfast',
          mainTableName: 'GFO_ZAKEN',
          id: '987654321',
          fields: [
            {
              fieldName: 'ZAAK_IDENTIFICATIE',
              text: 'Z2025-WK000108',
              fieldValue: 'Z2025-WK000108',
            },

            {
              fieldName: 'STARTDATUM',
              text: '27-05-2025',
              fieldValue: '2025-05-26T22:00:00.0000000Z',
            },
            {
              fieldName: 'EINDDATUM',
            },

            {
              fieldName: 'DATUM_TOT',
              text: '01-07-2028',
              fieldValue: '2028-06-30T22:00:00.0000000Z',
            },
          ],
        },
      ],
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/Link/GFO_ZAKEN/ADRESSEN/Table',
        method: 'POST',
      },
      res: {
        mainTableName: 'ADRESSEN',
        records: [
          {
            fmtCpn: 'Menno van Coehoornweg 15 9251LV Burgum',
            mainTableName: 'ADRESSEN',
            id: '126026873',
            fields: [
              {
                fieldName: 'FMT_CAPTION',
                text: 'Menno van Coehoornweg 15 9251LV Burgum',
                fieldValue: 'Menno van Coehoornweg 15 9251LV Burgum',
              },
            ],
          },
        ],
      },
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/Report/RunSavedReport',
        method: 'POST',
      },
      res: [
        {
          omschrijving: 'Intake',
          datum: '2025-05-26T22:00:00.0000000Z',
        },
      ],
    },
    {
      req: {
        url: 'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/SearchRequest',
        method: 'POST',
      },
      res: {
        mainTableName: 'DOCLINK',
        records: [
          {
            fmtCpn: '27-5-2025_Samenvatting_1064LK22.pdf D2025-05-000109',
            mainTableName: 'DOCLINK',
            id: '1191181',
            fields: [
              {
                fieldName: 'CREATEDATE',
                text: '27-05-2025 00:00',
                fieldValue: '2025-05-26T22:00:00.0000000Z',
              },

              {
                fieldName: 'OMSCHRIJVING',
                text: '27-5-2025_Samenvatting_1064LK22.pdf',
                fieldValue: '27-5-2025_Samenvatting_1064LK22.pdf',
              },

              {
                fieldName: 'ID',
                text: '1191181',
                fieldValue: '1191181',
              },

              {
                fieldName: 'FMT_CAPTION',
                text: '27-5-2025_Samenvatting_1064LK22.pdf D2025-05-000109 ',
                fieldValue:
                  '27-5-2025_Samenvatting_1064LK22.pdf D2025-05-000109 ',
              },
            ],
          },
        ],
      },
    },
  ];

  const expectedBBResponse = {
    caseType: 'Bed en breakfast',
    dateRequest: '2025-05-26T22:00:00.0000000Z',
    dateRequestFormatted: '27 mei 2025',
    dateDecision: null,
    dateDecisionFormatted: '-',
    dateStart: '',
    dateStartFormatted: '-',
    dateEnd: '',
    dateEndFormatted: '-',
    decision: null,
    isVerleend: false,
    id: '987654321',
    identifier: 'Z2025-WK000108',
    link: {
      to: '/toeristische-verhuur/vergunning/bed-and-breakfast/987654321',
      title: 'Vergunning bed & breakfast',
    },
    title: 'Vergunning bed & breakfast',
    processed: false,
    isExpired: false,
    location: 'Menno van Coehoornweg 15 \n9251LV Burgum',
    displayStatus: 'Ontvangen',
    documents: [
      {
        id: 'test-encrypted-id',
        title: 'Samenvatting aanvraagformulier',
        url: 'http://bff-api-host/api/v1/services/3448915414/documents/download?id=test-encrypted-id',
        download: 'Samenvatting aanvraagformulier',
        datePublished: '2025-05-26T22:00:00.0000000Z',
      },
    ],
    steps: [
      {
        id: 'step-1',
        status: 'Ontvangen',
        datePublished: '2025-05-26T22:00:00.0000000Z',
        isActive: true,
        isChecked: true,
      },
      {
        id: 'step-2',
        status: 'In behandeling',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
      {
        id: 'step-3',
        status: 'Afgehandeld',
        datePublished: '',
        isActive: false,
        isChecked: false,
      },
    ],
    heeftOvergangsRecht: false,
  };

  test('should fetch BB zaken successfully', async () => {
    for (const r of PowerBrowserMaatschapRequests) {
      const method = r.req.method.toLowerCase();
      const url = r.req.url.replace(
        'https://acc_gemeenteamsterdam_vth.moverheid.nl/api/',
        '/powerbrowser/'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (remoteApi as any)[method](url).reply(200, r.res);
    }
    const authProfileAndToken = getAuthProfileAndToken();
    authProfileAndToken.profile.id = '12345678';
    authProfileAndToken.profile.profileType = 'commercial';

    const result = await fetchBedAndBreakfast(authProfileAndToken.profile);
    expect(result.status).toBe('OK');
    expect(result.content).toEqual([expectedBBResponse]);
  });
});

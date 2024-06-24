import { remoteApi } from '../../../test-utils';
import { fetchClientNummer } from './hli-zorgned-service';
import * as request from '../../helpers/source-api-request';
import { fetchStadspassen, fetchTransacties } from './stadspas-gpass-service';
import { AuthProfileAndToken } from '../../helpers/app';
import * as encryptDecrypt from '../../../universal/helpers/encrypt-decrypt';

const pashouderResponse = {
  initialen: 'A',
  achternaam: 'Achternaam',
  passen: [
    {
      actief: false,
      pasnummer: 444444444444,
    },
    {
      actief: true,
      pasnummer: 333333333333,
    },
  ],
  sub_pashouders: [
    {
      initialen: 'B',
      achternaam: 'Achternaam',
      passen: [
        {
          actief: true,
          pasnummer: 666666666666,
        },
        {
          actief: false,
          pasnummer: 555555555555,
        },
      ],
    },
    {
      initialen: 'C',
      achternaam: 'Achternaam',
      passen: [
        {
          actief: true,
          pasnummer: 777777777777,
        },
        {
          actief: false,
          pasnummer: 888888888888,
        },
      ],
    },
  ],
};

const pasResponse = {
  actief: true,
  balance_update_time: '2020-04-02T12:45:41.000Z',
  budgetten: [
    {
      code: 'AMSTEG_10-14',
      naam: 'Kindtegoed 10-14',
      omschrijving: 'Kindtegoed',
      expiry_date: '2021-08-31T21:59:59.000Z',
      budget_assigned: 150,
      budget_balance: 0,
    },
  ],
  budgetten_actief: true,
  categorie: 'Amsterdamse Digitale Stadspas',
  categorie_code: 'A',
  expiry_date: '2020-08-31T23:59:59.000Z',
  id: 999999,
  originele_pas: {
    categorie: 'Amsterdamse Digitale Stadspas',
    categorie_code: 'A',
    id: 888888,
    pasnummer: 8888888888888,
    pasnummer_volledig: '8888888888888888888',
    passoort: { id: 11, naam: 'Digitale Stadspas' },
  },
  pasnummer: 6666666666666,
  pasnummer_volledig: '6666666666666666666',
  passoort: { id: 11, naam: 'Digitale Stadspas' },
};

const authProfileAndToken: AuthProfileAndToken = {
  profile: {
    authMethod: 'digid',
    profileType: 'private',
    id: '8899776655',
    sid: 'my-unique-session-id',
  },
  token: '',
};

describe('stadspas services', () => {
  const requestData = vi.spyOn(request, 'requestData');

  test('stadspas-zorgned-service', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: '123-123',
      },
    });

    const response = await fetchClientNummer('xyz123', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": "0363000123-123",
        "status": "OK",
      }
    `);
  });

  test('stadspas-gpass-service fail administratienummer endpoint', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

    const response = await fetchStadspassen('xyz123', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "code": "500",
        "content": null,
        "message": "AxiosError: Request failed with status code 500",
        "status": "ERROR",
      }
    `);
  });

  test('stadspas-gpass-service fail user unknown', async () => {
    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: '123-123',
      },
    });
    remoteApi.get('/stadspas/rest/sales/v1/pashouder?addsubs=true').reply(401);

    const response = await fetchStadspassen('xyz123', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": {
          "administratienummer": null,
          "stadspassen": [],
        },
        "status": "OK",
      }
    `);
  });

  test('stadspas-gpass-service fail only returns 1st pass', async () => {
    const encryptSpy = vi
      .spyOn(encryptDecrypt, 'encrypt')
      .mockReturnValueOnce([
        '1x2x3x-##########-4x5x6x',
        Buffer.from('xx'),
        Buffer.from('yy'),
      ]);

    const decryptSpy = vi
      .spyOn(encryptDecrypt, 'decrypt')
      .mockReturnValueOnce('123-unencrypted-456');

    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: '123-123',
      },
    });
    remoteApi
      .get('/stadspas/rest/sales/v1/pashouder?addsubs=true')
      .reply(200, pashouderResponse);
    // Only mocking 1 pas response
    remoteApi
      .get('/stadspas/rest/sales/v1/pas/333333333333?include_balance=true')
      .reply(200, pasResponse);

    const response = await fetchStadspassen('xyz123', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": {
          "administratienummer": "0363000123-123",
          "stadspassen": [
            {
              "budgets": [
                {
                  "budgetAssigned": 150,
                  "budgetBalance": 0,
                  "code": "AMSTEG_10-14",
                  "dateEnd": "2021-08-31T21:59:59.000Z",
                  "description": "Kindtegoed",
                  "urlTransactions": "http://bff-api-host/services/stadspas/transactions/1x2x3x-%23%23%23%23%23%23%23%23%23%23-4x5x6x",
                },
              ],
              "dateEnd": "2020-08-31T23:59:59.000Z",
              "id": "999999",
              "owner": "A Achternaam",
              "passNumber": "6666666666666666666",
              "passType": "kind",
            },
          ],
        },
        "status": "OK",
      }
    `);

    encryptSpy.mockRestore();
    decryptSpy.mockRestore();
  });

  test('stadspas-gpass-service Happy! All passes returned', async () => {
    const encryptSpy = vi
      .spyOn(encryptDecrypt, 'encrypt')
      .mockReturnValue([
        '1x2x3x-##########-4x5x6x',
        Buffer.from('xx'),
        Buffer.from('yy'),
      ]);

    const decryptSpy = vi
      .spyOn(encryptDecrypt, 'decrypt')
      .mockReturnValue('123-unencrypted-456');

    remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: '123-123',
      },
    });
    remoteApi
      .get('/stadspas/rest/sales/v1/pashouder?addsubs=true')
      .matchHeader('authorization', 'AppBearer 22222xx22222,0363000123-123')
      .reply(200, pashouderResponse);
    remoteApi
      .get(/\/stadspas\/rest\/sales\/v1\/pas\//)
      .times(3)
      .matchHeader('authorization', 'AppBearer 22222xx22222,0363000123-123')
      .reply(200, pasResponse);

    const response = await fetchStadspassen('xyz123', authProfileAndToken);

    expect(response).toMatchInlineSnapshot(`
      {
        "content": {
          "administratienummer": "0363000123-123",
          "stadspassen": [
            {
              "budgets": [
                {
                  "budgetAssigned": 150,
                  "budgetBalance": 0,
                  "code": "AMSTEG_10-14",
                  "dateEnd": "2021-08-31T21:59:59.000Z",
                  "description": "Kindtegoed",
                  "urlTransactions": "http://bff-api-host/services/stadspas/transactions/1x2x3x-%23%23%23%23%23%23%23%23%23%23-4x5x6x",
                },
              ],
              "dateEnd": "2020-08-31T23:59:59.000Z",
              "id": "999999",
              "owner": "A Achternaam",
              "passNumber": "6666666666666666666",
              "passType": "kind",
            },
            {
              "budgets": [
                {
                  "budgetAssigned": 150,
                  "budgetBalance": 0,
                  "code": "AMSTEG_10-14",
                  "dateEnd": "2021-08-31T21:59:59.000Z",
                  "description": "Kindtegoed",
                  "urlTransactions": "http://bff-api-host/services/stadspas/transactions/1x2x3x-%23%23%23%23%23%23%23%23%23%23-4x5x6x",
                },
              ],
              "dateEnd": "2020-08-31T23:59:59.000Z",
              "id": "999999",
              "owner": "B Achternaam",
              "passNumber": "6666666666666666666",
              "passType": "kind",
            },
            {
              "budgets": [
                {
                  "budgetAssigned": 150,
                  "budgetBalance": 0,
                  "code": "AMSTEG_10-14",
                  "dateEnd": "2021-08-31T21:59:59.000Z",
                  "description": "Kindtegoed",
                  "urlTransactions": "http://bff-api-host/services/stadspas/transactions/1x2x3x-%23%23%23%23%23%23%23%23%23%23-4x5x6x",
                },
              ],
              "dateEnd": "2020-08-31T23:59:59.000Z",
              "id": "999999",
              "owner": "C Achternaam",
              "passNumber": "6666666666666666666",
              "passType": "kind",
            },
          ],
        },
        "status": "OK",
      }
    `);

    encryptSpy.mockRestore();
    decryptSpy.mockRestore();
  });

  test('stadspas transacties Happy!', async () => {
    remoteApi
      .get(
        '/stadspas/rest/transacties/v1/budget?pasnummer=xxx567&budgetcode=yyyy&sub_transactions=true'
      )
      .matchHeader('authorization', 'AppBearer 22222xx22222,0363000123-123')
      .reply(200, {
        transacties: [
          {
            id: 'transactie-id',
            budget: { aanbieder: { naam: 'transactie naam' } },
            bedrag: 34.5,
            transactiedatum: '2024-04-25',
          },
        ],
      });

    const [transactionsKey] = encryptDecrypt.encrypt(
      `my-unique-session-id:yyyy:0363000123-123:xxx567`
    );

    const response = await fetchTransacties(
      'abc123',
      authProfileAndToken,
      transactionsKey
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "amount": 34.5,
            "datePublished": "2024-04-25",
            "id": "transactie-id",
            "title": "transactie naam",
          },
        ],
        "status": "OK",
      }
    `);
  });

  test('stadspas transacties unmatched session id', async () => {
    remoteApi
      .get(
        '/stadspas/rest/transacties/v1/budget?pasnummer=xxx567&budgetcode=yyyy&sub_transactions=true'
      )
      .matchHeader('authorization', 'AppBearer 22222xx22222,0363000123-123')
      .reply(200, {
        transacties: [
          {
            id: 'transactie-id',
            budget: { aanbieder: { naam: 'transactie naam' } },
            bedrag: 34.5,
            transactiedatum: '2024-04-25',
          },
        ],
      });

    const [transactionsKey] = encryptDecrypt.encrypt(
      `another-session-id:yyyy:0363000123-123:xxx567`
    );

    const response = await fetchTransacties(
      'abc123',
      authProfileAndToken,
      transactionsKey
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "code": 401,
        "content": null,
        "message": "Not authorized",
        "status": "ERROR",
      }
    `);
  });
});

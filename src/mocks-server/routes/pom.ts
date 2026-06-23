import { randomUUID } from 'node:crypto';

import axios from 'axios';

import { MOCK_API_BASE_URL, MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

const getPomPortaalUrlMock = (baseUrlOrPath: string): string =>
  `${baseUrlOrPath}/pom/portaal/emandate-scherm`;

const ibans = [
  { name: 'RABOBANK NEDERLAND', iban: 'NL18RABO0123459876', bankCode: 'RABO' },
  { name: 'ING BANK N.V.', iban: 'NL98INGB0003856625', bankCode: 'INGB' },
  { name: 'ABN AMRO BANK N.V', iban: 'NL98ABNA0416961347', bankCode: 'ABNA' },
  {
    name: 'GARANTIBANK INTERNATIONAL N.V.',
    iban: 'NL98UGBI0771565860',
    bankCode: 'UGBI',
  },
  { name: 'TRIODOS BANK N.V.', iban: 'NL98TRIO0254712320', bankCode: 'TRIO' },
  { name: 'SNS BANK N.V.', iban: 'NL98SNSB0908532792', bankCode: 'SNSB' },
  {
    name: 'DEUTSCHE BANK NEDERLAND N.V.',
    iban: 'NL97DEUT0265134951',
    bankCode: 'DEUT',
  },
  {
    name: 'BNP PARIBAS S.A. - THE NETHERLANDS BRANCH',
    iban: 'NL97BNPA0227673409',
    bankCode: 'BNPA',
  },
  {
    name: 'NV BANK NEDERLANDSE GEMEENTEN',
    iban: 'NL97BNGH0285061917',
    bankCode: 'BNGH',
  },
  {
    name: 'BANK OF AMERICA  N.A. AMSTERDAM',
    iban: 'NL97BOFA0266546412',
    bankCode: 'BOFA',
  },
];

let ibanIndex = 0;

function getNextIban(): { iban: string; bankCode: string } {
  const iban = ibans[ibanIndex];
  ibanIndex = (ibanIndex + 1) % ibans.length;
  return { iban: iban.iban, bankCode: iban.bankCode };
}

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-pom-mandate-page',
    url: getPomPortaalUrlMock(MOCK_BASE_PATH),
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const returnUrl =
          typeof req.query.returnUrl === 'string'
            ? req.query.returnUrl
            : process.env.MA_FRONTEND_URL;

        let creditorIBAN = 'NL91ABNA0417164300';
        if (returnUrl) {
          try {
            creditorIBAN =
              new URL(returnUrl).searchParams.get('iban') ?? creditorIBAN;
          } catch {
            // ignore malformed returnUrl in mock flow
          }
        }

        const htmlResponse = `
                  <h1>POM Incassomachtiging scherm</h1>
                   <a href="${returnUrl || process.env.MA_FRONTEND_URL}">
                    terug naar Mijn Amsterdam
                  </a>`;
        res.send(htmlResponse);

        setTimeout(async () => {
          try {
            const { iban, bankCode } = getNextIban();
            await axios({
              method: 'POST',
              url: 'http://localhost:5000/private/api/v1/services/afis/e-mandates/sign-request-status-notify',
              data: {
                id_client: '1000',
                debtornumber: '0001500091',
                cid: '2345678910',
                mpid: '1234567890',
                payment_reference: '123456789',
                id_request_client: 'test',
                event_type: 'payment',
                amount_total: '0',
                id_bank: bankCode,
                iban,
                bic: bankCode,
                account_owner: `John Doe ${ibanIndex}`,
                event_date: new Date().toISOString().split('T')[0],
                event_time: new Date()
                  .toISOString()
                  .split('T')[1]
                  .split('.')[0],
                variable1: creditorIBAN,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch {
            // ignore background callback errors in mock flow
          }
        }, 8000);
      },
    },
  },
  {
    id: 'post-pom-emandate-sign-request-url',
    url: `${MOCK_BASE_PATH}/pom/v3/paylinks`,
    method: 'POST',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const mpid = randomUUID();
        const returnUrl =
          typeof req.body.return_url === 'string' ? req.body.return_url : '';

        return res.send({
          paylink: `${getPomPortaalUrlMock(MOCK_API_BASE_URL)}?returnUrl=${returnUrl}`,
          paylink_id: mpid,
        });
      },
    },
  },
  {
    id: 'get-pom-emandate-sign-request-status',
    url: `${MOCK_BASE_PATH}/pom/v3/paylinks/:paylinkId`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (_req, res) => {
        setTimeout(() => {
          res.status(200).send({ status: 'paid' });
        }, 2000);
      },
    },
  },
];

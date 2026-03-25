const { randomUUID } = require('crypto');

const axios = require('axios');

const settings = require('../settings.cjs');
const getPomPortaalUrlMock = (baseUrlOrPath) =>
  `${baseUrlOrPath}/pom/portaal/emandate-scherm`;

// TEST IBANS https://ibanvalideren.nl/voorbeelden.html
const ibans = [
  {
    name: 'RABOBANK NEDERLAND',
    iban: 'NL18RABO0123459876',
    bankCode: 'RABO',
    accountNumber: '0123459876',
  },
  {
    name: 'ING BANK N.V.',
    iban: 'NL98INGB0003856625',
    bankCode: 'INGB',
    accountNumber: '0003856625',
  },
  {
    name: 'ABN AMRO BANK N.V',
    iban: 'NL98ABNA0416961347',
    bankCode: 'ABNA',
    accountNumber: '0416961347',
  },
  {
    name: 'GARANTIBANK INTERNATIONAL N.V.',
    iban: 'NL98UGBI0771565860',
    bankCode: 'UGBI',
    accountNumber: '0771565860',
  },
  {
    name: 'TRIODOS BANK N.V.',
    iban: 'NL98TRIO0254712320',
    bankCode: 'TRIO',
    accountNumber: '0254712320',
  },
  {
    name: 'SNS BANK N.V.',
    iban: 'NL98SNSB0908532792',
    bankCode: 'SNSB',
    accountNumber: '0908532792',
  },
  {
    name: 'DEUTSCHE BANK NEDERLAND N.V.',
    iban: 'NL97DEUT0265134951',
    bankCode: 'DEUT',
    accountNumber: '0265134951',
  },
  {
    name: 'BNP PARIBAS S.A. - THE NETHERLANDS BRANCH',
    iban: 'NL97BNPA0227673409',
    bankCode: 'BNPA',
    accountNumber: '0227673409',
  },
  {
    name: 'NV BANK NEDERLANDSE GEMEENTEN',
    iban: 'NL97BNGH0285061917',
    bankCode: 'BNGH',
    accountNumber: '0285061917',
  },
  {
    name: 'BANK OF AMERICA  N.A. AMSTERDAM',
    iban: 'NL97BOFA0266546412',
    bankCode: 'BOFA',
    accountNumber: '0266546412',
  },
];

let ibanIndex = 0;

function getNextIban() {
  const iban = ibans[ibanIndex];
  ibanIndex = (ibanIndex + 1) % ibans.length; // Loop back to the start when we reach the end
  return iban;
}

module.exports = [
  {
    id: 'get-pom-mandate-page',
    url: getPomPortaalUrlMock(settings.MOCK_BASE_PATH),
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: async (req, res) => {
            const queryIban = new URL(req.query.returnUrl).searchParams.get(
              'iban'
            );
            const creditorIBAN = queryIban || 'NL91ABNA0417164300';

            const htmlResponse = `
                <h1>POM E-mandaat scherm</h1>
                 <a href="${req.query.returnUrl || process.env.MA_FRONTEND_URL}">
                  terug naar Mijn Amsterdam
                </a>`;
            res.send(htmlResponse);

            // A mock push notification to simulate a real-world scenario.
            // Simulate a delay to mimic real-world processing time
            try {
              await new Promise((resolve) => setTimeout(resolve, 8000));
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
                  account_owner: 'John Doe ' + ibanIndex,
                  event_date: new Date().toISOString().split('T')[0],
                  event_time: new Date()
                    .toISOString()
                    .split('T')[1]
                    .split('.')[0],
                  variable1: `${creditorIBAN}`,
                },
                headers: {
                  'Content-Type': 'application/json',
                },
              });
            } catch (error) {
              console.error('Error sending POST request:', error.message);
            }
          },
        },
      },
    ],
  },
  {
    id: 'post-pom-emandate-sign-request-url',
    url: `${settings.MOCK_BASE_PATH}/pom/v3/paylinks`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: async (req, res, next, core) => {
            const mpid = randomUUID();
            return res.send({
              paylink: `${getPomPortaalUrlMock(settings.MOCK_API_BASE_URL)}?returnUrl=${req.body.return_url}`,
              paylink_id: mpid,
            });
          },
        },
      },
    ],
  },
  {
    id: 'get-pom-emandate-sign-request-status',
    url: `${settings.MOCK_BASE_PATH}/pom/v3/paylinks/:paylinkId`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        delay: 2000,
        options: {
          status: 200,
          body: {
            status: 'paid',
          },
        },
      },
    ],
  },
];

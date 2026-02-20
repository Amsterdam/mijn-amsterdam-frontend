const { randomUUID } = require('crypto');

const axios = require('axios');

const settings = require('../settings');
const getPomPortaalUrlMock = (baseUrlOrPath) =>
  `${baseUrlOrPath}/pom/portaal/emandate-scherm`;

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
          middleware: async (req, res, next, core) => {
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
                  id_bank: 'INGBNL2A',
                  iban: 'NL07INGB5373380466',
                  bic: 'INGBNL2A',
                  account_owner: 'John Doe',
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

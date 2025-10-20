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
              await new Promise((resolve) => setTimeout(resolve, 4000));
              await axios({
                method: 'POST',
                url: 'http://localhost:5000/private/api/v1/services/afis/e-mandates/sign-request-status-notify',
                data: {
                  id_client: '1000',
                  debtornumber: '123456',
                  cid: '2345678910',
                  mpid: '1234567890',
                  payment_reference: '123456789',
                  id_request_client: 'test',
                  event_type: 'payment',
                  amount_total: '45500',
                  id_bank: 'ABNANL2A',
                  iban: 'GB33BUKB20201555555555',
                  bic: 'INGBNL2A',
                  account_owner: 'John Doe',
                  event_date: '2024-01-05',
                  event_time: '11:27',
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
              mpid,
            });
          },
        },
      },
    ],
  },
  {
    id: 'post-pom-emandate-sign-request-status',
    url: `${settings.MOCK_BASE_PATH}/pom/paylinks/:mpid`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            status_code: 900,
          },
        },
      },
    ],
  },
];

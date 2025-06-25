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
          middleware: (req, res, next, core) => {
            axios({
              method: 'POST',
              url: 'http://localhost:5000/api/v1/services/afis/e-mandates/sign-request-status-notify',
              data: `<?xml version="1.0"?>
            <response>
              <id_client>1000</id_client>
              <debtornumber>123456</debtornumber>
              <cid>2345678910</cid>
              <mpid>1234567890</mpid>
              <payment_reference>123456789</payment_reference>
              <id_request_client>test</id_request_client>
              <event_type>payment</event_type>
              <amount_total>45500</amount_total>
              <id_bank>ABNANL2A</id_bank>
              <iban>GB33BUKB20201555555555</iban>
              <bic>INGBNL2A</bic>
              <account_owner>John Doe</account_owner>
              <event_date>2024-01-05</event_date>
              <event_time>11:27</event_time>
            </response>`,
              headers: {
                'Content-Type': 'text/xml',
              },
            });
            const htmlResponse = `
                <h1>POM E-mandaat scherm</h1>
                 <a href="${process.env.MA_FRONTEND_URL}">
                  Mijn Amsterdam
                </a>`;
            res.send(htmlResponse);
          },
        },
      },
    ],
  },
  {
    id: 'post-pom-emandate-sign-request-url',
    url: `${settings.MOCK_BASE_PATH}/pom/paylinks`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            paylink: getPomPortaalUrlMock(settings.MOCK_API_BASE_URL),
            mpid: '1234567890',
          },
        },
      },
    ],
  },
  {
    id: 'post-pom-emandate-sign-request-status',
    url: `${settings.MOCK_BASE_PATH}/pom/paylinks/:mpid`,
    method: 'POST',
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

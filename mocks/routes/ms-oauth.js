import { MOCK_BASE_PATH } from '../settings.js';
//http://localhost:3100/mocks-api/ms-oauth/tenant123/oauth2/v2.0/token
export default [
  {
    id: 'post-ms-oauth',
    url: `${MOCK_BASE_PATH}/ms-oauth/:tenant/oauth2/v2.0/token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { access_token: 'foo-bar' },
        },
      },
    ],
  },
];

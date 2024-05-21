const svwi_response = require('../fixtures/svwi.json');

// https://gemeente-amsterdam.atlassian.net/wiki/spaces/ma/pages/780927155/svwi+werk+en+inkomen (nog niet geimplementeerd?)
module.exports = [
  {
    id: 'get-svwi-tegel',
    url: '/api/mijnamsterdam/v1/autorisatie/tegel',
    method: 'get',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            statusCode: 200,
            body: svwi_response,
          },
          commercialUser: {
            statusCode: 200,
            body: 'no-content',
          },
        },
      },
    ],
  },
];

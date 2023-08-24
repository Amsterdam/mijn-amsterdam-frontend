import nock from 'nock';

export const bffApi = nock('http://bff-api-host:80').defaultReplyHeaders({
  'access-control-allow-origin': '*',
  'access-control-allow-credentials': 'true',
});
export const remoteApi = nock('http://remote-api-host').defaultReplyHeaders({
  'access-control-allow-origin': '*',
  'access-control-allow-credentials': 'true',
});

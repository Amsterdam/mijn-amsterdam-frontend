import nock from 'nock';
import { bffApiHost, remoteApiHost } from './setupTests';

const defaultReplyHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-credentials': 'true',
};

export const bffApi = nock(`${bffApiHost}:80`).defaultReplyHeaders(
  defaultReplyHeaders
);
export const remoteApi = nock(`${remoteApiHost}`).defaultReplyHeaders(
  defaultReplyHeaders
);

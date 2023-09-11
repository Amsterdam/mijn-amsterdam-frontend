import nock from 'nock';
import { bffApiHost, remoteApiHost } from './setupTests';

const defaultReplyHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Origin, Accept, Authorization, User-Agent, Content-Length, X-Requested-With',
};

export const bffApi = nock(`${bffApiHost}:80`).defaultReplyHeaders(
  defaultReplyHeaders
);
export const remoteApi = nock(`${remoteApiHost}`).defaultReplyHeaders(
  defaultReplyHeaders
);

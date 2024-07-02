import nock from 'nock';
import { bffApiHost, remoteApiHost } from './setupTests';
import { AuthProfileAndToken } from './server/helpers/app';

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

export const EMPTY_OKAY_RESPONSE = {
  content: '',
  status: 'OK',
};

/** Quikly create an AuthProfileAndToken object */
export function authProfileAndToken(
  profileType: ProfileType = 'private'
): AuthProfileAndToken {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      authMethod: 'digid',
      profileType,
      id: 'I.M Mokum',
      sid: '0D8ugZyqnzPTyknBDwxsMPb7',
    },
    token:
      'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJJLk0gTW9rdW0iLCJhdWQiOiJtaWpuYW1zdGVyZGFtIiwic2lkIjoiMEQ4dWdaeXFuelBUeWtuQkR3eHNNUGI3IiwiaWF0IjoxNzE5MzIxMzkyLCJleHAiOjE3MTkzMjg1OTJ9.Qdw-Vp9M0_WNnHAGtjSccpca4TVFp5BcNlgJ1Gj5A_XFqSqT5tKEw64NKIYtTBwCpmCxBTTCf7FJPMZ5wWhFdCdKhmGBneMBK4_DHfJIEkXtNvq1Cactjr8Qv3xifsl4bMUz6iDIyc0Ar3BkbMzo-_r_hMtlUTELoAz6Nq4GUlkPEOws0eiGQlhlc-GvyZs4mrzex9e6J_BaPNKs450bf0C3PzvGDjnur3ReaFDxZRRDWQqbvq9SbrDfFy4k3AXWkRlKV4lO5xnxiIEgxBbD0k3b2REVYq0xuxRd3-SIXDp9niS0_QMUQFYpiMwC7hUnF341k-rVoQQaVDIsFr7ldw',
  };

  if (profileType === 'commercial') {
    authProfileAndToken.profile.authMethod = 'eherkenning';
  }

  return authProfileAndToken;
}

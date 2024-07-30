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
export const remoteApi = nock(`${remoteApiHost}:80`).defaultReplyHeaders(
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
      'tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
  };

  if (profileType === 'commercial') {
    authProfileAndToken.profile.authMethod = 'eherkenning';
  }

  return authProfileAndToken;
}

/** Mocking class to instantiate response objects quikly.
 *
 *  Set `as unknnown as Response` after the instance to use.
 *  ex. `const res = new ResponseMock() as unknown as Response`.
 * */
export class ResponseMock {
  statusCode: number;
  locals: { requestID: string };

  constructor() {
    this.statusCode = 200;
    this.locals = {
      requestID: '123',
    };
  }

  send = vi.fn().mockImplementation((content) => content);
  status = vi.fn().mockImplementation((statusCode) => {
    this.statusCode = statusCode;
  });
  write = vi.fn();
  clearCookie = vi.fn();
}

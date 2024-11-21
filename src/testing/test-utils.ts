import { Request, Response } from 'express';
import nock from 'nock';
import UID from 'uid-safe';

import { AuthProfile, AuthProfileAndToken } from '../server/auth/auth-types';
import { createOIDCStub } from '../server/routing/router-development';
import { bffApiHost, remoteApiHost } from '../setupTests';
import { HTTP_STATUS_CODES } from '../universal/constants/errorCodes';

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
export function getAuthProfileAndToken(
  profileType: ProfileType = 'private'
): AuthProfileAndToken {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      authMethod: profileType === 'private' ? 'digid' : 'eherkenning',
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

export class ResponseMock {
  statusCode: number;
  locals: { requestID: string };

  static new() {
    return new ResponseMock() as unknown as Response;
  }

  private constructor() {
    this.statusCode = HTTP_STATUS_CODES.OK;
    const REQUEST_ID_LENGTH = 18;
    this.locals = {
      requestID: UID.sync(REQUEST_ID_LENGTH),
    };
  }

  send = vi.fn().mockImplementation(() => {
    return this;
  });
  status = vi.fn().mockImplementation((statusCode) => {
    this.statusCode = statusCode;
    return this;
  });
  write = vi.fn();
  clearCookie = vi.fn();
  render = vi.fn();
  redirect = vi.fn();
  append = vi.fn();
}

export class RequestMock {
  cookies: Record<string, string> = {};
  params: Record<string, string> = {};
  query: Record<string, string> = {};
  oidc: Record<string, string> | null = null;
  url: string | null = null;

  static new() {
    return new RequestMock() as unknown as Request & RequestMock;
  }

  setCookies(cookies: typeof this.cookies) {
    this.cookies = cookies;
    return this;
  }

  setParams<T extends typeof this.params>(params: T) {
    this.params = params;
    return this;
  }

  setQuery(query: typeof this.query) {
    this.query = query;
    return this;
  }

  setUrl(url: string) {
    this.url = url;
    return this;
  }

  async createOIDCStub(authProfile: AuthProfile) {
    const self = this as unknown as Request;
    await createOIDCStub(self, authProfile);
    return this;
  }

  get<T extends typeof this.params>() {
    return this as unknown as Request<T>;
  }
}

export async function getReqMockWithOidc(profile: AuthProfile) {
  const reqMockWithOidc = RequestMock.new();
  await reqMockWithOidc.createOIDCStub(profile);
  return reqMockWithOidc.get();
}

export const DEV_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
